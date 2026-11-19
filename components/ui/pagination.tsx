import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "cn"

const Pagination = React.forwardRef<HTMLElement, React.ComponentProps<"nav">>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />
)
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof PaginationLink>>(
  ({ className, ...props }, ref) => (
    <PaginationLink ref={ref} className={cn("gap-1 pl-2.5", className)} {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  )
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof PaginationLink>>(
  ({ className, ...props }, ref) => (
    <PaginationLink ref={ref} className={cn("gap-1 pr-2.5", className)} {...props}>
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  )
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
