export { useEffect } from "./useEffect";
export { useState } from "./useState";
export { useRef } from "./useRef";
export { useCustomId } from "./useCustomId";
export { useButtonEvent } from "./useButtonEvent";
export { useSelectMenuEvent } from "./useSelectMenuEvent";
export { useReducer } from "./useReducer";
export { useCollection } from "./useCollection";
export { useSelectComponent } from "./useSelectComponent";
export { useCountButtonComponent } from "./useCountButtonComponent";
export { useConfirmButtonComponent } from "./useConfirmButtonComponent";

/*
実装予定

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
// type useModal = (
//   //これジェネリクスで型付けしたいかも
//   //InteractionResponseModalDataを簡略化した形にすると良さそう
//   modalData: InteractionResponseModalData
// ) => {
//   result: Record<string, string> | null;
//   open: (interactionId: Snowflake, token: string) => void;
//   //
// };
