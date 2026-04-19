import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectSeparator,
} from "@/components/ui/select"

/**
 * MobileSelect - Responsive Select component that shows:
 * - Native Select on mobile
 * - Radix dropdown on desktop
 * 
 * Usage: Same as normal Select component
 */
export const MobileSelect = React.forwardRef(
  ({ children, open, onOpenChange, value, onValueChange, disabled, ...props }, ref) => {
    const isMobile = useIsMobile()
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }, [open])

    if (isMobile) {
      return (
        <Drawer open={isOpen} onOpenChange={(newOpen) => {
          setIsOpen(newOpen)
          onOpenChange?.(newOpen)
        }}>
          <DrawerTrigger asChild>
            <button
              ref={ref}
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-h-[44px]"
              disabled={disabled}
            >
              <span>{value || "Select..."}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="p-0">
            <div className="flex flex-col gap-2 p-4">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      )
    }

    // Desktop - use normal Select
    return (
      <Select
        value={value}
        onValueChange={onValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        {...props}
      >
        {children}
      </Select>
    )
  }
)
MobileSelect.displayName = "MobileSelect"

/**
 * Wrapper components for easier usage
 */
export const MobileSelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectTrigger ref={ref} className={cn("min-h-[44px]", className)} {...props}>
    {children}
  </SelectTrigger>
))
MobileSelectTrigger.displayName = "MobileSelectTrigger"

export const MobileSelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 min-h-[44px]",
      className
    )}
    {...props}
  >
    {children}
  </SelectItem>
))
MobileSelectItem.displayName = "MobileSelectItem"