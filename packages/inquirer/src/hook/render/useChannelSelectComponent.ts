import { ChannelSelect } from "../../adaptor";
import { useChannelSelectEvent } from "../effect/useChannelSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  AdaptorChannelTypes,
  ChannelSelectComponentBuilder,
  AdaptorPartialNonThreadChannel,
  AdaptorPartialThreadChannel,
} from "../../adaptor";

export type ChannelSelectResultValue<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = TypeSpecifiedChannel<ChannelTypes>;

export type TypeSpecifiedChannel<T extends AdaptorChannelTypes> = {
  guildText: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildText";
  };
  dm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "dm";
  };
  guildVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildVoice";
  };
  groupDm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "groupDm";
  };
  guildCategory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildCategory";
  };
  guildAnnouncement: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildAnnouncement";
  };
  announcementThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "announcementThread";
  };
  publicThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "publicThread";
  };
  privateThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "privateThread";
  };
  guildStageVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildStageVoice";
  };
  guildDirectory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildDirectory";
  };
  guildForum: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildForum";
  };
}[T];

export type UseChannelSelectComponentParams<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = {
  /**
   * 選択可能なチャンネルの種類
   * @default 全てのチャンネル
   */
  channelTypes?: ChannelTypes[];

  /**
   * チャンネルの選択状態が変化した時に呼ばれるハンドラ
   * @param selected
   */
  onSelected?: (selected: ChannelSelectResultValue<ChannelTypes>[]) => void;

  /**
   * 選択可能なチャンネルの最小数
   * @default 0
   */
  minValues?: number;

  /**
   * 選択可能なチャンネルの最大数
   * @default 制限無し
   */
  maxValues?: number;
};

export type UseChannelSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes>[],
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseChannelSingleSelectComponentParams<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = {
  channelTypes?: ChannelTypes[];
  onSelected?: (
    selected: ChannelSelectResultValue<ChannelTypes> | null
  ) => void;
  minValues?: 1;
};

export type UseChannelSingleSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes> | null,
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>
];

/**
 * ChannelSelectコンポーネントと選択状態を提供するRenderHook
 */
export const useChannelSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  params: UseChannelSelectComponentParams<ChannelTypes> = {}
): UseChannelSelectComponentResult<ChannelTypes> => {
  const customId = useCustomId("channelSelect");

  const [selected, setSelected] = useState<
    ChannelSelectResultValue<ChannelTypes>[]
  >([]);

  const markChanged = useObserveValue(selected, params.onSelected);

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
    markChanged();
  });

  return [
    selected,
    ChannelSelect({
      customId,
      channelTypes: params.channelTypes,
      minValues: params.minValues,
      maxValues: params.maxValues,
    }),
  ];
};

export const useChannelSingleSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  param: UseChannelSingleSelectComponentParams<ChannelTypes> = {}
): UseChannelSingleSelectComponentResult<ChannelTypes> => {
  const [selected, select] = useChannelSelectComponent({
    channelTypes: param.channelTypes,
    onSelected: (selected) => {
      param.onSelected?.(selected[0] ?? null);
    },
    minValues: param.minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, select];
};
