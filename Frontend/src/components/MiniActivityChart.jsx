function MiniActivityChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-16">
      {data.map((d, index) => (
        <div
          key={d.label}
          className={`min-w-0 flex-1 flex-col items-center gap-1 ${index === 0 ? "hidden md:flex" : "flex"}`}
        >
          <div
            className="w-full rounded-t bg-primary/70 dark:bg-primary transition-all duration-500"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "4px" : "2px" }}
          />
          <span className="block w-full text-center text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default MiniActivityChart;