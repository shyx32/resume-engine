export function reorderList<T>(list: T[], from: number, to: number): T[] {
  if (from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export interface ReorderConstraint<T> {
  canMove?: (item: T, from: number, to: number) => boolean;
}

export function safeReorder<T>(
  list: T[],
  from: number,
  to: number,
  constraint?: ReorderConstraint<T>
): T[] {
  const item = list[from];
  if (!item) {
    return list;
  }

  if (constraint?.canMove && !constraint.canMove(item, from, to)) {
    return list;
  }

  return reorderList(list, from, to);
}
