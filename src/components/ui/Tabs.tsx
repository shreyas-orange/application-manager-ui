interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function Tabs<T extends string>({ items, active, onChange }: TabsProps<T>) {
  return (
    <div className="ods-tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ods-tab${active === item.id ? " active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
