import { Row, useFetch, useSingleSelectComponent } from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

const weatherFetcher = async (
  cityCode: string
): Promise<{
  title: string;
  date: string;
  weather: string;
}> => {
  const rawData = await fetch(
    `https://weather.tsukumijima.net/api/forecast?city=${cityCode}`
  );

  const data = await rawData.json();
  return {
    title: data.title,
    date: data.forecasts[0].date,
    weather: data.forecasts[0].detail.weather,
  };
};

export const fetchWeatherPrompt = (() => {
  const [selected, SelectComponent] = useSingleSelectComponent({
    options: [
      {
        label: "tokyo",
        payload: "130000",
      },
      {
        label: "osaka",
        payload: "270000",
      },
      {
        label: "fukuoka",
        payload: "400010",
      },
      {
        label: "sapporo",
        payload: "016010",
      },
    ],
  });

  const { isLoading, data } = useFetch(selected?.payload, weatherFetcher);

  const description = () => {
    if (isLoading) {
      return "Loading...";
    }
    if (!data) {
      return "";
    }
    return `${data.date} ${data.title}は\n${data.weather}\nです。`;
  };

  return {
    embeds: [
      {
        title: "天気予報",
        description: description(),
      },
    ],

    components: [
      Row(
        SelectComponent({
          placeholder: "Select a city",
        })()
      ),
    ],
  };

  // const {} = useFetch();
}) satisfies Prompt<Record<string, unknown>>;
