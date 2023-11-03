// path/filename: components/PresetSelector.js

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'

export function PresetSelector() {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search presets..." />
                    <CommandEmpty>No presets found.</CommandEmpty>
                    <CommandGroup heading="Examples">
                        <CommandItem key={1}>
                            Rubric
                            <CheckIcon
                                className={cn('ml-auto h-4 w-4 opacity 100')}
                            />
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup className="pt-0">
                        <CommandItem>More examples</CommandItem>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
