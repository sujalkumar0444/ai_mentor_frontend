"use client"

import { ChevronRight, Link2Icon, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useParams, usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {

  const currentPath= usePathname();
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <div className="pt-3"></div>
      <SidebarMenu>
      {items.map((item) => {
          const isActive = currentPath.includes(item.url);
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                  <Link href={isActive ? "#" : item.url} >
                    <SidebarMenuButton
                      tooltip={item.title}
                      // aria-disabled={isActive}
                      className={`flex items-center gap-2 py-4 my-0.5 rounded-md transition mx-2 w-10/12 cursor-pointer ${
                      isActive
                        ? "text-white bg-black cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                    >
                  {item.icon && <item.icon />}
                  <span className="text-sm font-normal">{item.title}</span>
                </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </Collapsible>
        )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
