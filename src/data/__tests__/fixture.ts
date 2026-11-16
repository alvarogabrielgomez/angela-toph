import raw from "../profile.json";

/**
 * A deep copy of the real `profile.json`, safe to mutate in a test. Typed `any`
 * on purpose: tests break the shape (delete a key, change a type) to check what
 * the validator rejects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fixture(): any {
  return structuredClone(raw);
}
