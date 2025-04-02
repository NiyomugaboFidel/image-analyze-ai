"use client"

import React, { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreVertical, HardHat, FireExtinguisher, ArrowDown, AlertTriangle, Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

// Define TypeScript interfaces with more strict typing
export type HazardType = 'Missing Safety Gear' | 'Fire Risk' | 'Falling Object' | 'Other';
export type HazardLocation = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D' | string;
export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type StatusType = 'Open' | 'Resolving' | 'Resolved';

export interface Hazard {
  id: number;
  type: HazardType;
  location: HazardLocation;
  timestamp: string;
  severity: SeverityLevel;
  status: StatusType;
  image: string;
  description?: string; // Optional field for additional information
  reportedBy?: string;  // Optional field for tracking who reported
}

// Sample hazard data
export const hazardData: Hazard[] = [
  { id: 1, type: 'Missing Safety Gear', location: 'Zone A', timestamp: '2025-03-31T09:15:00', severity: 'High', status: 'Open', image: '/api/placeholder/400/300', reportedBy: 'John Smith' },
  { id: 2, type: 'Fire Risk', location: 'Zone B', timestamp: '2025-03-31T10:30:00', severity: 'Critical', status: 'Resolving', image: '/api/placeholder/400/300', reportedBy: 'Maria Garcia' },
  { id: 3, type: 'Falling Object', location: 'Zone C', timestamp: '2025-03-30T14:45:00', severity: 'Medium', status: 'Resolved', image: '/api/placeholder/400/300', reportedBy: 'Ahmed Hassan' },
  { id: 4, type: 'Missing Safety Gear', location: 'Zone D', timestamp: '2025-03-29T11:20:00', severity: 'Low', status: 'Resolved', image: '/api/placeholder/400/300', reportedBy: 'Sarah Johnson' },
  { id: 5, type: 'Fire Risk', location: 'Zone A', timestamp: '2025-03-28T16:05:00', severity: 'High', status: 'Open', image: '/api/placeholder/400/300', reportedBy: 'James Wilson' },
    { id: 6, type: 'Falling Object', location: 'Zone B', timestamp: '2025-03-27T08:50:00', severity: 'Medium', status: 'Resolving', image: '/api/placeholder/400/300', reportedBy: 'Emily Davis' },
    { id: 7, type: 'Other', location: 'Zone C', timestamp: '2025-03-26T12:15:00', severity: 'Low', status: 'Resolved', image: '/api/placeholder/400/300' },
    { id: 8, type: 'Missing Safety Gear', location: 'Zone D', timestamp: '2025-03-25T09:30:00', severity: 'Critical', status: 'Open', image: '/api/placeholder/400/300' },
    { id: 9, type: 'Fire Risk', location: 'Zone A', timestamp: '2025-03-24T14:00:00', severity: 'High', status: 'Resolving', image: '/api/placeholder/400/300' },
    { id: 10, type: 'Falling Object', location: 'Zone B', timestamp: '2025-03-23T11:45:00', severity: 'Medium', status: 'Resolved', image: '/api/placeholder/400/300' },
    { id: 11, type: 'Other', location: 'Zone C', timestamp: '2025-03-22T10:20:00', severity: 'Low', status: 'Open', image: '/api/placeholder/400/300' },
    { id: 12, type: 'Missing Safety Gear', location: 'Zone D', timestamp: '2025-03-21T15:10:00', severity: 'Critical', status: 'Resolving', image: '/api/placeholder/400/300' },
    { id: 13, type: 'Fire Risk', location: 'Zone A', timestamp: '2025-03-20T13:00:00', severity: 'High', status: 'Resolved', image: '/api/placeholder/400/300' },   
    { id: 14, type: 'Falling Object', location: 'Zone B', timestamp: '2025-03-19T12:30:00', severity: 'Medium', status: 'Open', image: '/api/placeholder/400/300' },
    { id: 15, type: 'Other', location: 'Zone C', timestamp: '2025-03-18T10:45:00', severity: 'Low', status: 'Resolving', image: '/api/placeholder/400/300' },
];

// Color mapping with types for better intellisense
type ColorMapping = Record<string, string>;

// Helper function to get severity badge with appropriate styling
const getSeverityBadge = (severity: SeverityLevel) => {
  const colors: ColorMapping = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };
  
  return (
    <Badge className={colors[severity] || 'bg-gray-100 text-gray-800'}>
      {severity}
    </Badge>
  );
};

// Helper function to get status badge with appropriate styling
const getStatusBadge = (status: StatusType) => {
  const colors: ColorMapping = {
    'Open': 'bg-red-100 text-red-800',
    'Resolving': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800'
  };
  
  return (
    <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

// Helper function to get hazard icon
const getHazardIcon = (type: HazardType) => {
  switch(type) {
    case 'Missing Safety Gear':
      return <HardHat className="h-4 w-4 mr-1" />;
    case 'Fire Risk':
      return <FireExtinguisher className="h-4 w-4 mr-1" />;
    case 'Falling Object':
      return <ArrowDown className="h-4 w-4 mr-1" />;
    default:
      return <AlertTriangle className="h-4 w-4 mr-1" />;
  }
};

// Custom date range filter function
const dateRangeFilterFn: FilterFn<Hazard> = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.from) return true;
  
  const rowDate = new Date(row.getValue(columnId) as string);
  const fromDate = new Date(filterValue.from);
  fromDate.setHours(0, 0, 0, 0);
  
  if (filterValue.to) {
    const toDate = new Date(filterValue.to);
    toDate.setHours(23, 59, 59, 999);
    return rowDate >= fromDate && rowDate <= toDate;
  }
  
  return rowDate >= fromDate;
};

// Interface for search parameters
interface SearchParams {
  query: string;
  searchFields: (keyof Hazard)[];
}

export function HazardDataTable() {
  // State for table functionality
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [dateRange, setDateRange] = useState<any>({});
  const [search, setSearch] = useState<SearchParams>({ query: '', searchFields: ['type', 'location', 'reportedBy'] });
  
  // Global search filter
  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(prev => ({ ...prev, query }));
    
    // Apply global filtering
    const filters = search.searchFields.map(field => ({ 
      id: field, 
      value: query 
    }));
    
    // Clear existing column filters
    setColumnFilters(filters);
  };
  
  // Toggle search fields
  const toggleSearchField = (field: keyof Hazard) => {
    setSearch(prev => {
      const newFields = prev.searchFields.includes(field)
        ? prev.searchFields.filter(f => f !== field)
        : [...prev.searchFields, field];
      return { ...prev, searchFields: newFields };
    });
  };

  // Define table columns with improved TypeScript
  const columns: ColumnDef<Hazard>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as HazardType;
        return (
          <div className="flex items-center">
            {getHazardIcon(type)}
            {type}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
      }
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
      }
    },
    {
      accessorKey: "reportedBy",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reported By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.original.reportedBy || "Unknown"}</div>,
      filterFn: (row, id, value) => {
        const reportedBy = row.original.reportedBy || '';
        return reportedBy.toLowerCase().includes(String(value).toLowerCase());
      }
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        return <div>{new Date(timestamp).toLocaleString()}</div>;
      },
      filterFn: dateRangeFilterFn
    },
    {
      accessorKey: "severity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Severity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getSeverityBadge(row.getValue("severity") as SeverityLevel),
      filterFn: (row, id, value) => {
        if (!value || value === "All") return true;
        return row.getValue(id) === value;
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getStatusBadge(row.getValue("status") as StatusType),
      filterFn: (row, id, value) => {
        if (!value || value === "All") return true;
        return row.getValue(id) === value;
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const hazard = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(hazard.id.toString())}>
                Copy hazard ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize react-table instance
  const table = useReactTable({
    data: hazardData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Apply date range filter
  React.useEffect(() => {
    if (dateRange.from) {
      table.getColumn("timestamp")?.setFilterValue(dateRange);
    } else {
      table.getColumn("timestamp")?.setFilterValue(undefined);
    }
  }, [dateRange, table]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hazard Management</CardTitle>
        <CardDescription>Monitor and manage safety hazards across all zones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Global search input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search hazards..."
                  value={search.query}
                  onChange={handleGlobalSearch}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge 
                  variant={search.searchFields.includes('type') ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSearchField('type')}
                >
                  Type
                </Badge>
                <Badge 
                  variant={search.searchFields.includes('location') ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSearchField('location')}
                >
                  Location
                </Badge>
                <Badge 
                  variant={search.searchFields.includes('reportedBy') ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSearchField('reportedBy')}
                >
                  Reporter
                </Badge>
              </div>
            </div>
            
            {/* Date range picker */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Filter by date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    className='bg-white rounded-md shadow-lg'
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className=" z-50  bg-white flex justify-end gap-2 p-2 border-b  rounded-b-lg">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange({})}
                    >
                      Clear
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today);
                        lastWeek.setDate(today.getDate() - 7);
                        setDateRange({ from: lastWeek, to: today });
                      }}
                    >
                      Last 7 days
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Severity filter */}
              <Select
              
                value={(table.getColumn("severity")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) => 
                  table.getColumn("severity")?.setFilterValue(value === "All" ? "" : value)
                }
              >
                <SelectTrigger className="w-36 ">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="All">All Severities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status filter */}
              <Select
                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) => 
                  table.getColumn("status")?.setFilterValue(value === "All" ? "" : value)
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolving">Resolving</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Column visibility dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-white' align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow >
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className='bg-white'> 
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}