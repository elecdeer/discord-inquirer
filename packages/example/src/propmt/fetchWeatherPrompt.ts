import {
  Row,
  useFetch,
  useLogger,
  useSingleSelectComponent,
} from "discord-inquirer";

import type { Prompt, Logger } from "discord-inquirer";

const weatherFetcher =
  (logger: Logger) =>
  async (
    cityCode: string,
  ): Promise<{
    title: string;
    date: string;
    weather: string;
  }> => {
    logger.log("debug", `fetching weather for ${cityCode}`);
    const rawData = await fetch(
      `https://weather.tsukumijima.net/api/forecast?city=${cityCode}`,
    );

    const data = (await rawData.json()) as {
      title: string;
      forecasts: {
        date: string;
        detail: {
          weather: string;
        };
      }[];
    };

    const result = {
      title: data.title,
      date: data.forecasts[0].date,
      weather: data.forecasts[0].detail.weather,
    };

    logger.log("debug", result);
    return result;
  };

export const fetchWeatherPrompt = (() => {
  const logger = useLogger();
  const [selected, SelectComponent] = useSingleSelectComponent({
    options: [
      {
        label: "tokyo",
        payload: "130010",
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

  const { isLoading, data } = useFetch(
    selected?.payload,
    weatherFetcher(logger),
  );

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
        title: "天気",
        description: description(),
      },
    ],

    components: [
      Row(
        SelectComponent({
          placeholder: "Select a city",
        })(),
      ),
    ],
  };
}) satisfies Prompt<Record<string, unknown>>;
