import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { NavMain } from "@/components/nav-main"
import { LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
  navMain: {
    title: string
    url: string
    icon?: LucideIcon | undefined
  }[]
}

export function AppSidebar({ user, navMain, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {/* <NavUser user={user} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border h-16 border-t">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}