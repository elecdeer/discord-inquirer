import type { InteractionResponseModalData, Snowflake } from "../adaptor";

export { useEffect } from "./useEffect";
export { useState } from "./useState";
export { useRef } from "./useRef";
export { useCustomId } from "./useCustomId";
export { useButtonEvent } from "./useButtonEvent";
export { useSelectMenuEvent } from "./useSelectMenuEvent";

/*
実装予定
useReducer
useReactionEvent

useCheckBoxButtonComponent
	状態値とコンポーネントを返す
	状態値をuseEffectで見れば値の変更をhookできる
	paramはlazyにすると良さそう
useSelectComponent
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
type useModal = (
  //これジェネリクスで型付けしたいかも
  //InteractionResponseModalDataを簡略化した形にすると良さそう
  modalData: InteractionResponseModalData
) => {
  result: Record<string, string> | null;
  open: (interactionId: Snowflake, token: string) => void;
  //
};
