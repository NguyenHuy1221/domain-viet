import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const navItems: Array<{ to: string; label: string; icon: string; exact?: boolean }> = [
    { to: "/", label: "Tổng quan", icon: "📊", exact: true },
    { to: "/domains", label: "Domain", icon: "🌐" },
    { to: "/customers", label: "Khách hàng", icon: "👥" },
    { to: "/devs", label: "Dev / Nhân sự", icon: "🧑‍💻" },
    { to: "/shopify", label: "Shopify", icon: "🛒" },
    { to: "/wordpress", label: "WordPress", icon: "📝" },
    { to: "/invoices", label: "Hóa đơn", icon: "🧾" },
    { to: "/reports", label: "Báo cáo", icon: "📈" },
    { to: "/settings", label: "Cài đặt", icon: "⚙️" },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full bg-background">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-white">
          <div className="px-5 py-4 border-b">
            <div className="text-lg font-bold text-slate-800">WebManager</div>
            <div className="text-xs text-slate-500">Quản lý domain & web</div>
          </div>
          <nav className="flex-1 p-3 space-y-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                activeOptions={{ exact: item.exact ?? false }}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-700 hover:bg-slate-100 data-[status=active]:bg-slate-900 data-[status=active]:text-white"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
              MK
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-800">Minh Khoa</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
