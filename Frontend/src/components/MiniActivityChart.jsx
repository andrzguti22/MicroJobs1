function MiniActivityChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-16">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary/70 dark:bg-primary transition-all duration-500"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "4px" : "2px" }}
          />
          <span className="text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default MiniActivityChart;