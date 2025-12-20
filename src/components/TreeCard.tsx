import Image from "next/image";
import { Link } from "@i18n/navigation";
import type { Tree } from "contentlayer/generated";

interface TreeCardProps {
  tree: Tree;
}

// Default blur placeholder for image loading
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==";

export function TreeCard({ tree }: TreeCardProps) {
  return (
    <Link
      href={`/trees/${tree.slug}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-primary/10 hover:border-primary/30"
    >
      <div className="aspect-video bg-primary/10 relative overflow-hidden">
        {tree.featuredImage ? (
          <Image
            src={tree.featuredImage}
            alt={tree.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 text-primary/30"
            >
              <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
            </svg>
          </div>
        )}
        {tree.conservationStatus && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-secondary/90 text-white rounded">
            {tree.conservationStatus}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {tree.title}
        </h3>
        <p className="text-sm text-foreground/60 italic mb-2">
          {tree.scientificName}
        </p>
        <p className="text-sm text-foreground/80 line-clamp-2">
          {tree.description}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-foreground/60">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            {tree.family}
          </span>
          {tree.maxHeight && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" />
              </svg>
              {tree.maxHeight}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
