import { Button } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useEffect } from "../effect/useEffect";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
import { useState } from "../state/useState";

import type { AdaptorButtonComponent } from "../../adaptor";
import type { UnfulfilledCurriedBuilder } from "../../util/curriedBuilder";
import type { Awaitable } from "../../util/types";

export type ValidateResult<T> = ValidateOkResult | ValidateErrorResult<T>;
export type ValidateOkResult = {
  ok: true;
  reason?: undefined;
};
export type ValidateErrorResult<T> = T extends undefined
  ? {
      ok: false;
      reason?: undefined;
    }
  : {
      ok: false;
      reason: T;
    };

export type ValidateResultState<T> =
  | (ValidateOkResult & { checked: true })
  | (ValidateErrorResult<T> & { checked: true })
  | { ok: false; checked: false; reason?: undefined };

export type UseConfirmButtonResult<T> = [
  result: ValidateResultState<T>,
  ConfirmButton: UnfulfilledCurriedBuilder<
    AdaptorButtonComponent,
    { type: "button"; customId: string },
    AdaptorButtonComponent
  >
];

export const useConfirmButtonComponent = <T = undefined>(
  validate: () => Awaitable<ValidateResult<T>>,
  onConfirm?: () => Awaitable<void>,
  deferInteractionAlways = true
): UseConfirmButtonResult<T> => {
  const customId = useCustomId("confirmButton");
  const [validateResult, setValidateResult] = useState<ValidateResultState<T>>({
    checked: false,
    ok: false,
  });

  const valueChanged = useRef(false);

  useButtonEvent(customId, async (_, deferUpdate) => {
    //canConfirmの結果がresolveする前に3秒経ってしまうとinteractionがタイムアウトするため、deferInteractionAlwaysがtrueの場合は先に呼ぶ
    if (deferInteractionAlways) {
      await deferUpdate();
    }

    const result = await validate();
    if (result.ok && !deferInteractionAlways) {
      await deferUpdate();
    }

    setValidateResult({
      ...result,
      checked: true,
    });
  });

  //あまり良い実装ではない
  useEffect(() => {
    if (valueChanged.current && validateResult.ok) {
      onConfirm?.();
      valueChanged.current = false;
    }
  }, [validateResult]);

  const renderComponent = Button({
    customId,
  });

  return [validateResult, renderComponent];
};
