export class CircularArray<T extends { path: string }> {
  private data: T[];
  private current: number;

  constructor(data: T[]) {
    this.data = data;
    this.current = -1;
  }

  next(): T {
    this.current = (this.current + 1) % this.data.length;
    return this.data[this.current];
  }

  prev(): T {
    this.current = (this.current + this.data.length - 1) % this.data.length;
    return this.data[this.current];
  }

  seek(path: string): CircularArray<T> {
    const index = this.data.findIndex((item) => item.path === path);
    if (index === -1) {
      throw new Error(`Path not found: ${path}`);
    }
    this.current = index;
    return this;
  }

  update(data: T[]) {
    this.data = data;
    this.current = 0;
    return this;
  }
}
