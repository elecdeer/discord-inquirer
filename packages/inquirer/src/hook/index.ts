export * from "./state/useCollection";
export * from "./state/useCustomId";
export * from "./state/useMemo";
export * from "./state/useReducer";
export * from "./state/useRef";
export { useState } from "./state/useState";

export * from "./effect/useButtonEvent";
export { useEffect } from "./effect/useEffect";
export * from "./effect/useStringSelectEvent";
export * from "./effect/useUserSelectEvent";
export * from "./effect/useRoleSelectEvent";
export * from "./effect/useChannelSelectEvent";
export * from "./effect/useMentionableSelectEvent";

export * from "./render/useConfirmButtonComponent";
export * from "./render/useCountButtonComponent";
export * from "./render/useStringSelectComponent";

/*
実装予定

useCounterComponent
  - 数値 + の3ボタン
useSelectPaging
	option[]を受け取って、page値とsetPageとページ内のoption[]を返す

 */

/*
モーダルどうすっかな
モーダルを開くのはinteractionへの返答としてのみ可能

 */

//interactionにhookして
// type useModal = (
//   //これジェネリクスで型付けしたいかも
//   //InteractionResponseModalDataを簡略化した形にすると良さそう
//   modalData: InteractionResponseModalData
// ) => {
//   result: Record<string, string> | null;
//   open: (interactionId: Snowflake, token: string) => void;
//   //
// };
