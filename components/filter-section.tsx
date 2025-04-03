import { Checkbox } from "./ui/checkbox";

interface FilterSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}

export function FilterSection({ title, items, selected, onToggle }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
        {items.map(item => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${title}-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
              className="data-[state=checked]:bg-primary"
            />
            <label
              htmlFor={`${title}-${item}`}
              className="text-sm leading-none peer-disabled:cursor-not-allowed 
                peer-disabled:opacity-70 cursor-pointer"
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}