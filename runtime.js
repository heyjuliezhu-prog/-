// Minimal adapter for the downloaded Turbopack modules; original bundles are unchanged.
(() => {
  const factories = new Map(), modules = new Map();
  function load(id) {
    if (modules.has(id)) return modules.get(id).exports;
    const factory = factories.get(id);
    if (!factory) throw new Error(`Missing downloaded module ${id}`);
    const module = {exports: {}};
    modules.set(id, module);
    factory({
      i: load,
      A: id => Promise.resolve(load(id)),
      l: () => Promise.resolve(),
      v: fn => {module.exports = fn(load);},
      s: (entries, target = id) => {
        if (!modules.has(target)) modules.set(target, {exports: {}});
        const out = modules.get(target).exports;
        for (let i = 0; i < entries.length;) {
          const name = entries[i++], kind = entries[i++], value = entries[i++];
          if (kind !== 0) throw new Error(`Unsupported export kind ${kind}`);
          out[name] = value;
        }
      }
    });
    return module.exports;
  }
  globalThis.TURBOPACK = {push(chunk) {
    for (let i = 1; i < chunk.length;) {
      const ids = [];
      while (typeof chunk[i] === 'number') ids.push(chunk[i++]);
      const factory = chunk[i++];
      if (typeof factory !== 'function') throw new Error('Unexpected chunk format');
      ids.forEach(id => factories.set(id, factory));
    }
  }};
  globalThis.brandAiModules = {load};
})();
