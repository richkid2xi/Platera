export default function BestSeller({ data }: { data?: any[] }) {
  const items = data || [];

  return (
    <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-700 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Best Sellers</h3>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col justify-center h-[200px] items-center text-foreground-400">
          <i className="ri-shopping-bag-3-line text-3xl mb-2"></i>
          <p className="text-sm">No sales data yet</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg border-b border-background-100 dark:border-foreground-800 last:border-b-0 hover:bg-background-50 dark:hover:bg-foreground-800/50 transition-colors cursor-default"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-background-100 dark:bg-foreground-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground-800 dark:text-foreground-200 truncate font-body">{item.name}</p>
                <p className="text-xs text-foreground-400 font-body">{item.orders} orders</p>
              </div>
              <span className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 whitespace-nowrap font-heading">
                {item.revenue}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}