import Head from "next/head";
import bikeImg from "../../bike-roller.jpg";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import {
  CreateRitInputType,
  createRitValidator,
} from "../../shared/create-rit-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";

// https://webreflection.medium.com/using-the-input-datetime-local-9503e7efdce

function toDateTimeString(date: Date): string {
  const isoString = date.toISOString();
  // the datetime-local can't handle the Z at the end, remove it
  // also remove :ss.SSSS
  return isoString.substring(0, isoString.length - 8);
}

const EditPageContent: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { data } = trpc.useQuery(["rit.getById", { id }]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateRitInputType>({
    resolver: zodResolver(createRitValidator),
  });
  const { mutate } = trpc.useMutation(["rit.updateCompletely"], {
    onSuccess: () => {
      router.push("/");
    },
  });

  if (!data) return <div>no data</div>;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-4 bg-slate-200">
      <div className="w-full xl:w-3/4 lg:w-11/12 flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bikeImg.src}
          alt="fiets"
          className="w-full h-auto hidden lg:block lg:w-1/2 rounded-l-lg object-cover"
        />
        <div className="w-full lg:w-1/2 bg-white p-5 rounded-lg lg:rounded-l-none">
          <h1 className="text-4xl text-center text-gray-800">Rit aanpassen</h1>
          <form
            className="px-8 pt-6 pb-8 bg-white rounded flex flex-col gap-6"
            onSubmit={handleSubmit(async (formData) => {
              // wait for mutation to complete, while in this function 'isSumitting' is true on 'formState'
              await mutate({
                id: data.id,
                date: formData.startTijd ?? data.date,
                duration: formData.duur ?? data.duration,
                distance: formData.afstand ?? data.distance,
                calories: formData.calorie ?? data.calories,
                resistance: formData.weerstand ?? data.resistance,
              });
            })}
          >
            <fieldset
              className="grid gap-4 disabled:opacity-60"
              disabled={isSubmitting}
            >
              <Controller
                name="startTijd"
                control={control}
                render={({ field, fieldState }) => {
                  return (
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
                        {...field}
                        value={
                          field.value
                            ? toDateTimeString(field.value)
                            : toDateTimeString(data.date)
                        }
                        onChange={(e) => {
                          // make sure to create a date using valueAsNumber and NOT value
                          // or JS will try to help and do weird timezone summertime shenanigans
                          field.onChange(new Date(e.target.valueAsNumber));
                        }}
                        required
                      />
                      {fieldState.error && (
                        <p className="font-medium tracking-wide text-red-500 text-sm mt-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </label>
                  );
                }}
              />
              <Controller
                name="duur"
                control={control}
                render={({ field, fieldState }) => {
                  return (
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
                        required
                        {...field}
                        value={field.value ?? data.duration}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                      />
                      {fieldState.error && (
                        <p className="font-medium tracking-wide text-red-500 text-sm mt-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </label>
                  );
                }}
              />
              {/* TODO: make visible form value in km, floating point allowed, but store everything in m, as integer */}
              <Controller
                name="afstand"
                control={control}
                render={({ field, fieldState }) => {
                  return (
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
                        required
                        {...field}
                        value={field.value ?? data.distance}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                      />
                      {fieldState.error && (
                        <p className="font-medium tracking-wide text-red-500 text-sm mt-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </label>
                  );
                }}
              />
              <Controller
                name="calorie"
                control={control}
                render={({ field, fieldState }) => {
                  return (
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
                        {...field}
                        step={1}
                        min={0}
                        required
                        value={field.value ?? data.calories}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                      />
                      {fieldState.error && (
                        <p className="font-medium tracking-wide text-red-500 text-sm mt-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </label>
                  );
                }}
              />
              <Controller
                name="weerstand"
                control={control}
                render={({ field, fieldState }) => {
                  return (
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
                        {...field}
                        step={1}
                        min={0}
                        required
                        value={field.value ?? data.resistance}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                      />
                      {fieldState.error && (
                        <p className="font-medium tracking-wide text-red-500 text-sm mt-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </label>
                  );
                }}
              />
            </fieldset>
            <input
              className="self-end text-center w-full px-4 py-2 font-bold text-white bg-green-700 rounded-full hover:bg-green-500 focus:bg-green-500 outline-green-700 outline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              value="Aanpassen"
              disabled={isSubmitting}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

const EditPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }

  return (
    <>
      <Head>
        <title>Rit aanpassen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <EditPageContent id={id} />;
    </>
  );
};

export default EditPage;
