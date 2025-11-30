import { createSignal, createEffect, For } from "solid-js";

export default function TableFilter(props) {
  const [search, setSearch] = createSignal("");
  const [sort, setSort] = createSignal("");
  const [location, setLocation] = createSignal("");
  const [condition, setCondition] = createSignal("");

  // trigger ke parent setiap ada perubahan
  createEffect(() => {
    props.onChange?.({
      search: search(),
      sort: sort(),
      location: location(),
      condition: condition(),
    });
  });

  return (
    <div class="flex flex-wrap gap-3 items-center mb-4">
      {/* 🔍 Search */}
      <input
        type="text"
        class="border rounded px-3 py-2 w-64"
        placeholder="Cari asset..."
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />

      {/* 🔽 Sort */}
      <select
        class="border rounded px-3 py-2"
        value={sort()}
        onInput={(e) => setSort(e.currentTarget.value)}
      >
        <option value="">Urutkan</option>
        <For each={props.sortOptions || []}>
          {(opt) => <option value={opt.value}>{opt.label}</option>}
        </For>
      </select>

      {/* 📍 Filter Location */}
      <select
        class="border rounded px-3 py-2"
        value={location()}
        onInput={(e) => setLocation(e.currentTarget.value)}
      >
        <option value="">Semua Lokasi</option>
        <For each={props.locations || []}>
          {(loc) => <option value={loc.id}>{loc.name}</option>}
        </For>
      </select>

      {/* ⚙️ Filter Condition */}
      <select
        class="border rounded px-3 py-2"
        value={condition()}
        onInput={(e) => setCondition(e.currentTarget.value)}
      >
        <option value="">Semua Kondisi</option>
        <For each={props.conditions || []}>
          {(c) => <option value={c.id}>{c.name}</option>}
        </For>
      </select>
    </div>
  );
}
