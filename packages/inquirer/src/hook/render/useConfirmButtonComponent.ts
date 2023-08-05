import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  NonLinkButtonComponentBuilder,
  AdaptorButtonInteraction,
} from "../../adaptor";
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
  ConfirmButton: NonLinkButtonComponentBuilder<{
    customId: string;
  }>,
];

export type UseConfirmButtonParams<T> = {
  validate: () => Awaitable<ValidateResult<T>>;
  onConfirm?: () => Awaitable<void>;
  deferInteractionAlways?: boolean;
  filter?: (interaction: Readonly<AdaptorButtonInteraction>) => boolean;
};

/**
 * ボタンを押したときに検証を行い、検証が成功した場合のみonConfirmを実行する
 * @param validate ボタンが押されたときに実行される検証関数
 * @param onConfirm validateが成功したときに実行される関数
 * @param deferInteractionAlways validateの結果に関わらずinteractionをdeferUpdateするかどうか (デフォルトはtrue)
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonConfirmは実行されない
 * @returns [validateResult, ConfirmButton]
 */
export const useConfirmButtonComponent = <T = undefined>({
  validate,
  onConfirm,
  deferInteractionAlways = true,
  filter = (_) => true,
}: UseConfirmButtonParams<T>): UseConfirmButtonResult<T> => {
  const customId = useCustomId("confirmButton");
  const [validateResult, setValidateResult] = useState<ValidateResultState<T>>({
    checked: false,
    ok: false,
  });

  const markChanged = useObserveValue(validateResult, (value) => {
    if (!value.ok) return;
    onConfirm?.();
  });

  useButtonEvent(customId, async (interaction, deferUpdate) => {
    if (!filter(interaction)) return;

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
    markChanged();
  });

  const renderComponent = NonLinkButton({
    customId,
  });

  return [validateResult, renderComponent];
};
