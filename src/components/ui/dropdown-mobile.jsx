import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

/**
 * MobileDropdownMenu - Responsive Dropdown that shows:
 * - Native Drawer on mobile
 * - Radix dropdown on desktop
 * 
 * Usage: Wrap children with MobileDropdownMenuTrigger and MobileDropdownMenuContent
 */
export const MobileDropdownMenu = ({ children, open, onOpenChange }) => {
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
        {children}
      </Drawer>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {children}
    </DropdownMenu>
  )
}

/**
 * Mobile-aware trigger - renders as DrawerTrigger on mobile, DropdownMenuTrigger on desktop
 */
export const MobileDropdownMenuTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerTrigger asChild>
        <button ref={ref} className={cn("min-h-[44px]", className)} {...props}>
          {children}
        </button>
      </DrawerTrigger>
    )
  }

  return (
    <DropdownMenuTrigger ref={ref} className={className} {...props}>
      {children}
    </DropdownMenuTrigger>
  )
})
MobileDropdownMenuTrigger.displayName = "MobileDropdownMenuTrigger"

/**
 * Mobile-aware content
 */
export const MobileDropdownMenuContent = React.forwardRef(({ children, className, ...props }, ref) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent className={cn("p-0", className)}>
        <div className="flex flex-col gap-1 p-2">
          {children}
        </div>
      </DrawerContent>
    )
  }

  return (
    <DropdownMenuContent ref={ref} className={className} {...props}>
      {children}
    </DropdownMenuContent>
  )
})
MobileDropdownMenuContent.displayName = "MobileDropdownMenuContent"

/**
 * Mobile-aware menu item
 */
export const MobileDropdownMenuItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className={cn("min-h-[44px] py-2", className)}
    {...props}
  >
    {children}
  </DropdownMenuItem>
))
MobileDropdownMenuItem.displayName = "MobileDropdownMenuItem"