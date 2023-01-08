import { ChannelSelect } from "../../adaptor";
import { useChannelSelectEvent } from "../effect/useChannelSelectEvent";
import { useEffect } from "../effect/useEffect";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
import { useState } from "../state/useState";

import type {
  AdaptorPartialChannel,
  AdaptorChannelTypes,
  AdaptorChannelSelectComponent,
} from "../../adaptor";
import type { FulfilledCurriedBuilder } from "../../util/curriedBuilder";

export type ChannelSelectResultValue<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = Extract<
  AdaptorPartialChannel,
  {
    type: ChannelTypes;
  }
>;

export type UseChannelSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes>[],
  ChannelSelect: FulfilledCurriedBuilder<
    AdaptorChannelSelectComponent,
    {
      type: "stringSelect";
      customId: string;
      channelTypes: ChannelTypes[];
    },
    AdaptorChannelSelectComponent
  >
];

export type UseChannelSingleSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes> | null,
  ChannelSelect: FulfilledCurriedBuilder<
    AdaptorChannelSelectComponent,
    {
      type: "stringSelect";
      customId: string;
      channelTypes: ChannelTypes[];
      maxValues: 1;
    },
    AdaptorChannelSelectComponent
  >
];

export const useChannelSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  params: {
    channelTypes?: ChannelTypes[];
    onSelected?: (selected: ChannelSelectResultValue<ChannelTypes>[]) => void;
  } = {}
): UseChannelSelectComponentResult<ChannelTypes> => {
  const customId = useCustomId("channelSelect");

  const [selected, setSelected] = useState<
    ChannelSelectResultValue<ChannelTypes>[]
  >([]);

  useChannelSelectEvent(customId, async (_, channels, deferUpdate) => {
    await deferUpdate();

    const filteredChannels = channels.filter(
      (channel): channel is ChannelSelectResultValue<ChannelTypes> => {
        if (params.channelTypes === undefined) return true;
        return (
          (params.channelTypes as string[]).includes(channel.type) ?? false
        );
      }
    );

    setSelected(filteredChannels);
    valueChanged.current = true;
  });

  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      params.onSelected?.(selected);
      valueChanged.current = false;
    }
  }, [selected, params.onSelected]);

  return [
    selected,
    ChannelSelect({
      customId,
      channelTypes: params.channelTypes,
    }),
  ];
};

export const useChannelSingleSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  params: {
    channelTypes?: ChannelTypes[];
    onSelected?: (
      selected: ChannelSelectResultValue<ChannelTypes> | null
    ) => void;
  } = {}
): UseChannelSingleSelectComponentResult<ChannelTypes> => {
  const [selected, select] = useChannelSelectComponent({
    channelTypes: params.channelTypes,
    onSelected: (selected) => {
      params.onSelected?.(selected[0] ?? null);
    },
  });

  return [
    selected[0] ?? null,
    select({
      maxValues: 1,
    }),
  ];
};
