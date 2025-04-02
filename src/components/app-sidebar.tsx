import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { NavMain } from "@/components/nav-main"
import { Clock, ChartBarBig } from "lucide-react"
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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Availability",
      url: "/mentor/availability",
      icon: Clock
    },
    {
      title: "Dashboard",
      url: "/mentor/dashboard",
      icon: ChartBarBig
    },
    // {
    //   title: "Potential Jobs",
    //   url: "/v2/potential-jobs",
    //   icon: ""
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {/* <NavUser user={data.user} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border h-16 border-t">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
