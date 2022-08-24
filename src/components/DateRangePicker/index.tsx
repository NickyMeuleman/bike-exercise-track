// this folder is based on https://codesandbox.io/s/reverent-faraday-5nwk87
// well, "based on", it's a straight copy when I write this comment. Thanks Devon!
import { useRef } from "react";
import { useDateRangePickerState } from "@react-stately/datepicker";
import { useDateRangePicker } from "react-aria";
import { FieldButton } from "./Button";
import { RangeCalendar } from "./RangeCalendar";
import { DateField } from "./DateField";
import { Popover } from "./Popover";
import {
  BackspaceIcon,
  CalendarIcon,
  ExclamationIcon,
} from "@heroicons/react/outline";

export function DateRangePicker(props: any) {
  let state = useDateRangePickerState(props);
  let ref: any = useRef();
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDateRangePicker(props, state, ref);

  return (
    <div className="relative inline-flex flex-col text-left font-mono">
      <span {...labelProps} className="text-sm text-gray-800 font-sans">
        {props.label}
      </span>
      <div {...groupProps} ref={ref} className="flex group">
        <div className="flex bg-white border border-gray-300 group-hover:border-gray-400 transition-colors rounded-l-md pr-10 group-focus-within:border-sky-600 group-focus-within:group-hover:border-sky-600 p-1 relative">
          <DateField {...startFieldProps} />
          <span aria-hidden="true" className="px-2 text-slate-600">
            tot
          </span>
          <DateField {...endFieldProps} />
          {state.validationState === "invalid" ? (
            <ExclamationIcon className="w-6 h-6 text-red-500 absolute right-1" />
          ) : (
            (state.value?.start || state.value?.end) && (
              <BackspaceIcon
                className="w-6 h-6 text-slate-400 absolute right-1"
                onClick={()=>{ props.clear();
                }}
              />
            )
          )}
        </div>
        <FieldButton {...buttonProps} isPressed={state.isOpen}>
          <CalendarIcon className="w-5 h-5 text-gray-700 group-focus-within:text-sky-700" />
        </FieldButton>
      </div>
      {state.isOpen && (
        <Popover
          {...dialogProps}
          isOpen={state.isOpen}
          onClose={() => state.setOpen(false)}
        >
          <RangeCalendar {...calendarProps} />
        </Popover>
      )}
    </div>
  );
}
