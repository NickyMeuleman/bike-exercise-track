import type { NextPage } from "next";
import Head from "next/head";
import bikeImg from "../../bike-roller.jpg";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// https://webreflection.medium.com/using-the-input-datetime-local-9503e7efdce

function toDateTimeString(date: Date): string {
  const isoString = date.toISOString();
  // the datetime-local can't handle the Z at the end, remove it
  // also remove :ss.SSSS
  return isoString.substring(0, isoString.length - 8);
}

const EditPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data } = trpc.useQuery(["rit.getById", { id }]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (!data) return;
    setDate(data.date);
  }, [data]);

  if (!data) return <div>no data</div>;

  return (
    <>
      <Head>
        <title>Rit aanpassen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex flex-col items-center justify-center p-4 bg-slate-200">
        <div className="w-full xl:w-3/4 lg:w-11/12 flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bikeImg.src}
            alt="fiets"
            className="w-full h-auto hidden lg:block lg:w-1/2 rounded-l-lg object-cover"
          />
          <div className="w-full lg:w-1/2 bg-white p-5 rounded-lg lg:rounded-l-none">
            <form
              className="px-8 pt-6 pb-8 bg-white rounded flex flex-col gap-6"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <h1 className="text-4xl text-center text-gray-800">
                Rit aanpassen
              </h1>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-gray-700">Starttijd</span>
                  <input
                    type="datetime-local"
                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                    name="starttijd"
                    value={toDateTimeString(date)}
                    onChange={(e) => {
                      // make sure to create a date using valueAsNumber and NOT value
                      // or JS will try to help and do weird timezone summertime shenanigans
                      setDate(new Date(e.target.valueAsNumber));
                    }}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Duur</span>
                  <input
                    type="number"
                    className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                    step={1}
                    min={0}
                    name="duur"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Afstand</span>
                  <input
                    type="number"
                    className="
                      mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                        "
                    step={0.1}
                    min={0}
                    name="afstand"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Calorieën</span>
                  <input
                    type="number"
                    className="
                      mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                        "
                    step={1}
                    min={0}
                    name="calorie"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Weerstand</span>
                  <input
                    type="number"
                    className="
                      mt-1
                      block
                      w-full
                      rounded-md
                      border-gray-300
                      shadow-sm
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                    step={1}
                    min={0}
                    name="weerstand"
                    required
                  />
                </label>
              </div>
              <button
                className="self-end text-center w-full px-4 py-2 font-bold text-white bg-green-700 rounded-full hover:bg-green-500 focus:bg-green-500 outline-green-700 outline-offset-4"
                type="submit"
              >
                Aanpassen
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const EditPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }

  return <EditPageContent id={id} />;
};

export default EditPage;
