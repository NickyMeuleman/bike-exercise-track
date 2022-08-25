import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  today,
  startOfMonth,
  endOfMonth,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  CalendarDate,
} from "@internationalized/date";
import { inferQueryOutput, trpc } from "../utils/trpc";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import {
  BackspaceIcon,
  FilterIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  XIcon,
} from "@heroicons/react/outline";
import { DateRangePicker } from "../components/DateRangePicker/index";
import { Header } from "../components/Header";

type Data = inferQueryOutput<"rit.getAll">;
type SortKeys = keyof Omit<Data[0], "id">;
type SortOrder = "ascn" | "desc";

type DateFilter = {
  kind: "date";
  val: { start: CalendarDate; end: CalendarDate };
};
type GenericFilter = {
  kind: keyof Omit<Data[0], "id" | "date">;
  val: { operator: "lt" | "gt"; num: number };
};

function minutesToObj(min: number): { hours: number; minutes: number } {
  const hours = Math.floor(min / 60);
  const minutes = Math.floor(min % 60);
  return { hours, minutes };
}

function SortButton({
  sortOrder,
  columnKey,
  sortKey,
  onClick,
}: {
  sortOrder: SortOrder;
  columnKey: SortKeys;
  sortKey: SortKeys;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button onClick={onClick} className="px-3">
      {sortKey === columnKey ? (
        <span className="-mb-2 grid">
          <SortAscendingIcon
            className={`col-start-1 row-start-1 h-5 w-5 transition duration-300 ease-out ${
              sortOrder === "ascn" ? "opacity-100" : "opacity-0"
            } text-sky-600`}
          />
          <SortDescendingIcon
            className={`col-start-1 row-start-1 h-5 w-5 transition duration-300 ease-out ${
              sortOrder === "desc" ? "opacity-100" : "opacity-0"
            } text-sky-600`}
          />
        </span>
      ) : (
        <SortDescendingIcon className="col-start-1 row-start-1 -mb-2 h-5 w-5 text-slate-300 duration-300 ease-out" />
      )}
    </button>
  );
}

const Home: NextPage = () => {
  const [sortKey, setSortKey] = useState<SortKeys>("distance");
  const [sortOrder, setSortOrder] = useState<SortOrder>("ascn");
  const pingref = useRef<HTMLSpanElement>(null);
  const [filters, setFilters] = useState<(DateFilter | GenericFilter)[]>([
    {
      kind: "date",
      val: {
        start: startOfMonth(today(getLocalTimeZone())),
        end: endOfMonth(today(getLocalTimeZone())),
      },
    },
  ]);

  // forgive me for this, I just wanted to make the thing work. does tailwind have a way to remove classes after an animation completes once?
  useEffect(() => {
    if (pingref.current) {
      pingref.current.classList.add("animate-ping-once");
      pingref.current.classList.remove("hidden");
      setTimeout(() => {
        if (pingref.current) {
          pingref.current.classList.remove("animate-ping-once");
          pingref.current.classList.add("hidden");
        }
      }, 300);
    }
  }, [filters.length]);

  const ritten = trpc.useQuery(["rit.getAll"], {
    select: (data) => {
      let filteredData = data;

      for (let filter of filters) {
        filteredData = filteredData.filter((rit) => {
          if (filter.kind == "date") {
            const date = parseAbsoluteToLocal(rit.date.toISOString());
            const startCompare = date.compare(
              filter.val?.start ?? startOfMonth(today(getLocalTimeZone()))
            );
            const beforeStart = startCompare < 0;
            const endCompare = date.compare(
              filter.val?.end ?? endOfMonth(today(getLocalTimeZone()))
            );
            const afterEnd = endCompare > 0;

            return !beforeStart && !afterEnd;
          } else {
            if (filter.val.operator === "lt") {
              return rit[filter.kind] < filter.val.num;
            } else {
              return rit[filter.kind] > filter.val.num;
            }
          }
        });
      }

      const sortedData = filteredData.sort((a, b) => {
        return a[sortKey] > b[sortKey] ? 1 : -1;
      });

      if (sortOrder === "ascn") {
        sortedData.reverse();
      }

      return sortedData;
    },
  });

  function changeSort(key: SortKeys) {
    if (key == sortKey) {
      setSortOrder(sortOrder === "ascn" ? "desc" : "ascn");
    }
    setSortKey(key);
  }

  const headers: { key: SortKeys; label: string }[] = [
    { key: "date", label: "Datum" },
    { key: "duration", label: "Duur" },
    { key: "distance", label: "Afstand" },
    { key: "calories", label: "Calorieën" },
    { key: "resistance", label: "Weerstand" },
  ];

  const totals = ritten.data?.reduce(
    (acc, rit) => {
      return {
        distance: acc.distance + rit.distance,
        duration: acc.duration + rit.duration,
        calories: acc.calories + rit.calories,
      };
    },
    {
      distance: 0,
      duration: 0,
      calories: 0,
    }
  );

  const totaleAfstand = new Intl.NumberFormat("nl-BE", {
    style: "unit",
    unit: "kilometer",
    unitDisplay: "short",
  }).formatToParts((totals?.distance || 0) / 1000);
  const afstandNum = totaleAfstand
    .filter((item) => item.type != "unit")
    .map((item) => item.value)
    .join("");
  const afstandUnit = totaleAfstand?.find((item) => item.type == "unit")?.value;

  const totalDuration = minutesToObj(totals?.duration || 0);
  return (
    <>
      <Head>
        <title>Hometrainer rit tracker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-slate-800 pb-12">
        <Header dark={true} />
        <div className="container mx-auto flex flex-col justify-center gap-4 p-4">
          <div className="flex justify-between align-baseline">
            <h2 className="text-2xl text-slate-100">
              Filters{" "}
              <FilterIcon className="inline-block h-6 w-6 text-slate-100/40" />
            </h2>
            <button
              className={`flex content-center items-baseline justify-center gap-1 rounded-full border-2 border-transparent bg-sky-800 py-2 px-3 text-base leading-normal text-sky-100 outline-none hover:bg-opacity-80 focus:ring-1 focus:ring-offset-2 active:ring-0 active:ring-offset-0 disabled:cursor-not-allowed disabled:bg-opacity-50`}
              onClick={() => {
                setFilters([]);
              }}
              disabled={filters.length <= 0}
            >
              <span>Alle</span>
              {filters.length > 0 && (
                <span className="relative inline-flex">
                  <span className="flex rounded-full bg-sky-500 px-2 py-1 text-xs font-bold uppercase">
                    {filters.length}
                  </span>
                  <span
                    ref={pingref}
                    className={`absolute inline-flex h-full w-full animate-ping-once rounded-full bg-sky-400 opacity-75`}
                  ></span>
                </span>
              )}
              <span className="font-semibold">filters verwijderen</span>
              <BackspaceIcon className="inline-block h-6 w-6 self-end text-sky-100" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {headers.map(({ key, label }) => {
              if (key === "date") {
                return (
                  <DateRangePicker
                    key={key}
                    label={label}
                    value={
                      filters.find(({ kind }) => kind == "date")?.val || null
                    }
                    onChange={(newRange: any) => {
                      setFilters((old) => {
                        const withoutDate = old.filter(
                          ({ kind }) => kind !== "date"
                        );
                        return [
                          ...withoutDate,
                          { kind: "date", val: newRange },
                        ];
                      });
                    }}
                    clear={() => {
                      setFilters((old) =>
                        old.filter(({ kind }) => kind !== "date")
                      );
                    }}
                  />
                );
              }
              return (
                <div key={key} className="flex flex-col">
                  <span className="text-sm text-gray-800">{label}</span>
                  <form
                    className="group flex"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.target as HTMLFormElement);
                      // ewwww, type casting
                      const operator = data.get(`${key}-op`) as "lt" | "gt";
                      const num = parseFloat(data.get(`${key}-num`) as string);
                      if (operator && num) {
                        setFilters((old) => {
                          return [
                            ...old,
                            { kind: key, val: { operator, num } },
                          ];
                        });
                      }
                    }}
                  >
                    <select
                      name={`${key}-op`}
                      className="relative flex rounded-l-md border border-gray-300 bg-white p-1 pr-10 text-sm transition-colors group-focus-within:border-sky-600 group-hover:border-gray-400 group-focus-within:group-hover:border-sky-600"
                      style={{
                        // I wish I didn't have to override like this, because adding a class of "shadow-none" didn't work
                        boxShadow: "none",
                      }}
                    >
                      <option value={"gt"}>Groter dan</option>
                      <option value={"lt"}>Kleiner dan</option>
                    </select>
                    <input
                      name={`${key}-num`}
                      type="number"
                      className="relative -ml-px flex w-16 border border-gray-300 bg-white p-1 shadow-none transition-colors focus:shadow-none group-focus-within:border-sky-600 group-hover:border-gray-400 group-focus-within:group-hover:border-sky-600"
                      style={{
                        // I wish I didn't have to override like this, because adding a class of "shadow-none" didn't work
                        boxShadow: "none",
                      }}
                    />
                    <button
                      type="submit"
                      className="-ml-px rounded-r-md border border-gray-300 bg-gray-50 px-2 text-sm outline-none transition-colors active:border-gray-400 active:bg-gray-200 group-focus-within:border-sky-600 group-hover:border-gray-400 group-focus-within:group-hover:border-sky-600"
                    >
                      Instellen
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1">
            {filters.map(({ kind, val }, i) => {
              if (kind === "date") {
                return (
                  <button
                    key={i}
                    className={`flex content-center items-center justify-center gap-1 rounded-full border-2 border-transparent bg-sky-500 py-0.5 px-1 text-base leading-normal text-sky-100 outline-none hover:bg-opacity-80 focus:ring-1 focus:ring-offset-2 active:ring-0 active:ring-offset-0 disabled:cursor-not-allowed disabled:bg-opacity-50`}
                    onClick={() =>
                      setFilters((old) =>
                        old.filter(({ kind }) => kind !== "date")
                      )
                    }
                  >
                    <span className="text-sm text-sky-200">Datum:</span>
                    <span className="text-sm font-semibold text-sky-100">
                      {val.start.day}-{val.start.month}-{val.start.year}{" "}
                      <span className="font-normal">tot</span> {val.end.day}-
                      {val.end.month}-{val.end.year}{" "}
                    </span>
                    <XIcon className="inline-block h-3 w-auto text-sky-100" />
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  className={`flex content-center items-center justify-center gap-1 rounded-full border-2 border-transparent bg-sky-500 py-0.5 px-1 text-base leading-normal text-sky-100 outline-none hover:bg-opacity-80 focus:ring-1 focus:ring-offset-2 active:ring-0 active:ring-offset-0 disabled:cursor-not-allowed disabled:bg-opacity-50`}
                  onClick={() => {
                    setFilters((old) => {
                      return old.filter((filter) => {
                        if (filter.kind == "date") return true;
                        const sameKind = filter.kind === kind;
                        const sameOp = filter.val.operator === val.operator;
                        const sameNum = filter.val.num === val.num;
                        return !(sameKind && sameOp && sameNum);
                      });
                    });
                  }}
                >
                  <span className="text-sm text-sky-200">
                    {headers.find((item) => item.key === kind)?.label}:
                  </span>
                  <span className="text-sm font-semibold text-sky-100">
                    {val.operator === "lt" ? "Kleiner dan" : "Groter dan"}{" "}
                    {val.num}
                  </span>
                  <XIcon className="inline-block h-3 w-auto text-sky-100" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-slate-200 pt-12">
        <div className="container mx-auto -mt-24 flex flex-col gap-4 p-4 pt-0">
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="border-1 rounded-md border-gray-300 bg-gray-50 p-4 shadow-md">
              <div className="pb-4 text-sm font-semibold text-slate-600">
                Totale afstand
              </div>
              <span className="text-5xl text-slate-700">{afstandNum}</span>
              <span className="text-base text-slate-700">{afstandUnit}</span>
            </div>
            <div className="border-1 rounded-md border-gray-300 bg-gray-50 p-4 shadow-md">
              <div className="pb-4 text-sm font-semibold text-slate-600">
                Totale tijd
              </div>
              {totalDuration.hours > 0 ? (
                <span>
                  <span className="text-5xl text-slate-700">
                    {new Intl.NumberFormat("nl-BE", {
                      style: "unit",
                      unit: "hour",
                      unitDisplay: "narrow",
                    })
                      .formatToParts(totalDuration.hours)
                      .reduce((acc, item) => {
                        if (item.type !== "unit") {
                          return acc + item.value;
                        }
                        return acc;
                      }, "")}
                  </span>
                  <span className="text-base text-slate-700">
                    {new Intl.NumberFormat("nl-BE", {
                      style: "unit",
                      unit: "hour",
                      unitDisplay: "narrow",
                    })
                      .formatToParts(totalDuration.hours)
                      .reduce((acc, item) => {
                        if (item.type === "unit") {
                          return acc + item.value;
                        }
                        return acc;
                      }, "")}
                  </span>
                </span>
              ) : null}
              <span className="ml-1 text-5xl text-slate-700">
                {new Intl.NumberFormat("nl-BE", {
                  style: "unit",
                  unit: "minute",
                  unitDisplay: "narrow",
                })
                  .formatToParts(totalDuration.minutes)
                  .reduce((acc, item) => {
                    if (item.type !== "unit") {
                      return acc + item.value;
                    }
                    return acc;
                  }, "")}
              </span>
              <span className="text-base text-slate-700">
                {new Intl.NumberFormat("nl-BE", {
                  style: "unit",
                  unit: "minute",
                  unitDisplay: "narrow",
                })
                  .formatToParts(totalDuration.minutes)
                  .reduce((acc, item) => {
                    if (item.type === "unit") {
                      return acc + item.value;
                    }
                    return acc;
                  }, "")}
              </span>
            </div>
            <div className="border-1 rounded-md border-gray-300 bg-gray-50 p-4 shadow-md">
              <div className="pb-4 text-sm font-semibold text-slate-600">
                Totale verbranding
              </div>
              <span className="ml-1 text-5xl text-slate-700">
                {totals?.calories}{" "}
              </span>
              <span className="text-base text-slate-700">kcal</span>
            </div>
          </div>
          <table className="w-full divide-y divide-gray-300 rounded-md bg-slate-200 shadow-md">
            <thead className="bg-gray-50">
              <tr>
                {headers.map(({ key, label }) => {
                  return (
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 first:rounded-tl-md last:rounded-tr-md first:sm:pl-6"
                      key={key}
                    >
                      {/* <th> is display: table-header-group; so this wrapping div lets us display:flex; the children */}
                      <div className="flex">
                        <p>{label}</p>
                        <SortButton
                          columnKey={key}
                          onClick={() => changeSort(key)}
                          {...{
                            sortOrder,
                            sortKey,
                          }}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {ritten?.data?.map((rit, i) => {
                let roundl =
                  ritten.data.length - 1 === i ? "rounded-bl-md" : "";
                let roundr =
                  ritten.data.length - 1 === i ? "rounded-br-md" : "";
                return (
                  <tr
                    key={rit.id}
                    className="even:bg-slate-50 hover:bg-slate-200"
                  >
                    <td
                      className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6 ${roundl}`}
                    >
                      <Link href={`/edit/${rit.id}`}>
                        <a>
                          {new Intl.DateTimeFormat("nl-BE", {
                            dateStyle: "medium",
                          }).format(rit.date)}
                        </a>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {new Intl.NumberFormat("nl-BE", {
                        style: "unit",
                        unit: "minute",
                        unitDisplay: "short",
                      }).format(rit.duration)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {new Intl.NumberFormat("nl-BE", {
                        style: "unit",
                        unit: "kilometer",
                        unitDisplay: "short",
                      }).format(rit.distance / 1000)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {rit.calories}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-4 text-sm ${roundr}`}
                    >
                      {rit.resistance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
