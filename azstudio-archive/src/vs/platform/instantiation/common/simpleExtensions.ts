// Minimal stub for VS Code DI system - services work standalone
export const InstantiationType = {
  Delayed: 0,
  Eager: 1
};

export function registerSingleton(id, ctor, instantiationType) {
  // No-op: services are instantiated directly in AzStudio
}
