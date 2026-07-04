import { bestSellers } from '@/mocks/dashboard';

export default function BestSellers() {
  return (
    <div className="bg-white dark:bg-foreground-900 rounded-lg border border-background-200 dark:border-foreground-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground-900 dark:text-foreground-100 text-base">Best Sellers</h3>
        <button className="text-xs text-primary-500 font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap">
          Full report <i className="ri-arrow-right-line ml-0.5"></i>
        </button>
      </div>

      <div className="flex flex-col">
        {bestSellers.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3 border-b border-background-100 dark:border-foreground-800 last:border-b-0"
          >
            <span className="text-sm font-bold text-foreground-300 dark:text-foreground-600 w-5 flex-shrink-0 font-heading">
              {index + 1}
            </span>
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
    </div>
  );
}