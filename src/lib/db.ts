import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  resetCode?: string | null;
  resetCodeExpiry?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  tags: string[];
  isDeleted: boolean;
  deletedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  tasks: Task[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "todo.json");

// In-memory cache
let inMemoryDb: DatabaseSchema | null = null;
let writeQueue = Promise.resolve();

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (inMemoryDb) return inMemoryDb;

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      inMemoryDb = JSON.parse(raw);
      if (!inMemoryDb?.users) inMemoryDb = { users: [], tasks: [] };
      if (!inMemoryDb?.tasks) inMemoryDb.tasks = [];

      // Ensure backwards compatibility with tasks that don't have tags or isDeleted
      inMemoryDb.tasks = inMemoryDb.tasks.map((t) => ({
        ...t,
        tags: Array.isArray(t.tags) ? t.tags : [],
        isDeleted: Boolean(t.isDeleted),
        deletedAt: t.deletedAt || null,
      }));

      return inMemoryDb;
    } catch (e) {
      console.error("Failed to read database file, creating fresh store:", e);
    }
  }

  inMemoryDb = {
    users: [],
    tasks: [],
  };

  saveDatabaseSync(inMemoryDb);
  return inMemoryDb;
}

function saveDatabaseSync(data: DatabaseSchema): void {
  ensureDataDir();
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
}

function scheduleSave(): Promise<void> {
  const currentSnapshot = JSON.parse(JSON.stringify(loadDatabase()));
  writeQueue = writeQueue.then(async () => {
    try {
      ensureDataDir();
      const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
      await fs.promises.writeFile(tempFile, JSON.stringify(currentSnapshot, null, 2), "utf-8");
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error("Error saving database:", err);
    }
  });
  return writeQueue;
}

export const db = {
  user: {
    async findUnique({ where }: { where: { email?: string; id?: string } }): Promise<User | null> {
      const store = loadDatabase();
      if (where.id) {
        return store.users.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return (
          store.users.find(
            (u) => u.email.toLowerCase() === where.email!.toLowerCase()
          ) || null
        );
      }
      return null;
    },

    async create({
      data,
    }: {
      data: { name: string; email: string; password: string };
    }): Promise<User> {
      const store = loadDatabase();
      const now = new Date().toISOString();
      const newUser: User = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        createdAt: now,
        updatedAt: now,
      };

      store.users.push(newUser);
      await scheduleSave();
      return newUser;
    },

    async update({
      where,
      data,
    }: {
      where: { email?: string; id?: string };
      data: Partial<Omit<User, "id" | "createdAt">>;
    }): Promise<User> {
      const store = loadDatabase();
      const index = store.users.findIndex((u) => {
        if (where.id) return u.id === where.id;
        if (where.email) return u.email.toLowerCase() === where.email.toLowerCase();
        return false;
      });

      if (index === -1) {
        throw new Error("User not found");
      }

      const existing = store.users[index];
      const updated: User = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      store.users[index] = updated;
      await scheduleSave();
      return updated;
    },
  },

  task: {
    async findMany({
      where,
      orderBy,
    }: {
      where: {
        userId: string;
        isDeleted?: boolean;
        status?: string;
        priority?: string;
        tag?: string;
        search?: string;
        OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
      };
      orderBy?: { createdAt?: "asc" | "desc"; updatedAt?: "asc" | "desc"; deletedAt?: "asc" | "desc" };
    }): Promise<Task[]> {
      const store = loadDatabase();
      const isDeletedFilter = where.isDeleted !== undefined ? where.isDeleted : false;

      let result = store.tasks.filter(
        (t) => t.userId === where.userId && Boolean(t.isDeleted) === isDeletedFilter
      );

      if (where.status && where.status !== "ALL") {
        result = result.filter((t) => t.status === where.status);
      }

      if (where.priority && where.priority !== "ALL") {
        result = result.filter((t) => t.priority === where.priority);
      }

      if (where.tag && where.tag !== "ALL") {
        const targetTag = where.tag.toLowerCase();
        result = result.filter(
          (t) => Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase() === targetTag)
        );
      }

      if (where.search) {
        const query = where.search.toLowerCase();
        result = result.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query)) ||
            (Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      }

      if (orderBy?.createdAt) {
        const dir = orderBy.createdAt === "desc" ? -1 : 1;
        result.sort(
          (a, b) =>
            dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      } else if (orderBy?.updatedAt) {
        const dir = orderBy.updatedAt === "desc" ? -1 : 1;
        result.sort(
          (a, b) =>
            dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        );
      } else if (orderBy?.deletedAt) {
        const dir = orderBy.deletedAt === "desc" ? -1 : 1;
        result.sort((a, b) => {
          const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
          const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
          return dir * (timeA - timeB);
        });
      }

      return result;
    },

    async findUnique({ where }: { where: { id: string } }): Promise<Task | null> {
      const store = loadDatabase();
      return store.tasks.find((t) => t.id === where.id) || null;
    },

    async count({
      where,
    }: {
      where: { userId: string; status?: string; isDeleted?: boolean };
    }): Promise<number> {
      const store = loadDatabase();
      const isDeletedFilter = where.isDeleted !== undefined ? where.isDeleted : false;

      return store.tasks.filter((t) => {
        if (t.userId !== where.userId) return false;
        if (Boolean(t.isDeleted) !== isDeletedFilter) return false;
        if (where.status && t.status !== where.status) return false;
        return true;
      }).length;
    },

    async getAllTags(userId: string): Promise<string[]> {
      const store = loadDatabase();
      const tagsSet = new Set<string>();
      store.tasks
        .filter((t) => t.userId === userId && !t.isDeleted)
        .forEach((t) => {
          if (Array.isArray(t.tags)) {
            t.tags.forEach((tag) => {
              if (tag.trim()) tagsSet.add(tag.trim());
            });
          }
        });
      return Array.from(tagsSet).sort();
    },

    async create({
      data,
    }: {
      data: {
        title: string;
        description?: string | null;
        status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
        priority?: "LOW" | "MEDIUM" | "HIGH";
        tags?: string[];
        userId: string;
      };
    }): Promise<Task> {
      const store = loadDatabase();
      const now = new Date().toISOString();
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || null,
        status: data.status || "PENDING",
        priority: data.priority || "MEDIUM",
        tags: Array.isArray(data.tags) ? data.tags : [],
        isDeleted: false,
        deletedAt: null,
        userId: data.userId,
        createdAt: now,
        updatedAt: now,
      };

      store.tasks.unshift(newTask); // New tasks at top
      await scheduleSave();
      return newTask;
    },

    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<Omit<Task, "id" | "userId" | "createdAt">>;
    }): Promise<Task> {
      const store = loadDatabase();
      const index = store.tasks.findIndex((t) => t.id === where.id);
      if (index === -1) {
        throw new Error("Task not found");
      }

      const existing = store.tasks[index];
      const updated: Task = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      store.tasks[index] = updated;
      await scheduleSave();
      return updated;
    },

    async softDelete(id: string, userId: string): Promise<Task> {
      const store = loadDatabase();
      const index = store.tasks.findIndex((t) => t.id === id && t.userId === userId);
      if (index === -1) {
        throw new Error("Task not found");
      }

      store.tasks[index].isDeleted = true;
      store.tasks[index].deletedAt = new Date().toISOString();
      store.tasks[index].updatedAt = new Date().toISOString();

      await scheduleSave();
      return store.tasks[index];
    },

    async restore(id: string, userId: string): Promise<Task> {
      const store = loadDatabase();
      const index = store.tasks.findIndex((t) => t.id === id && t.userId === userId);
      if (index === -1) {
        throw new Error("Task not found");
      }

      store.tasks[index].isDeleted = false;
      store.tasks[index].deletedAt = null;
      store.tasks[index].updatedAt = new Date().toISOString();

      await scheduleSave();
      return store.tasks[index];
    },

    async permanentDelete(id: string, userId: string): Promise<Task> {
      const store = loadDatabase();
      const index = store.tasks.findIndex((t) => t.id === id && t.userId === userId);
      if (index === -1) {
        throw new Error("Task not found");
      }

      const [removed] = store.tasks.splice(index, 1);
      await scheduleSave();
      return removed;
    },

    async emptyRecycleBin(userId: string): Promise<number> {
      const store = loadDatabase();
      const initialCount = store.tasks.length;
      store.tasks = store.tasks.filter((t) => !(t.userId === userId && t.isDeleted));
      const removedCount = initialCount - store.tasks.length;
      await scheduleSave();
      return removedCount;
    },
  },
};
