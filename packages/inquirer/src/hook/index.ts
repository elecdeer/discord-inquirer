export { useCollection } from "./state/useCollection";
export { useCustomId } from "./state/useCustomId";
export { useMemo } from "./state/useMemo";
export { useReducer } from "./state/useReducer";
export { useRef } from "./state/useRef";
export { useState } from "./state/useState";

export { useButtonEvent } from "./effect/useButtonEvent";
export { useEffect } from "./effect/useEffect";
export { useSelectMenuEvent } from "./effect/useSelectMenuEvent";

export { useConfirmButtonComponent } from "./render/useConfirmButtonComponent";
export { useCountButtonComponent } from "./render/useCountButtonComponent";
export { useSelectComponent } from "./render/useSelectComponent";

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
