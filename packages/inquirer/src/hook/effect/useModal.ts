import { isAdaptorModalSubmitInteraction, messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";
import { generateCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
import { useState } from "../state/useState";
import { useEffect } from "./useEffect";

import type {
  AdaptorInteractionResponseModalData,
  AdaptorModalActionRowComponent,
  AdaptorTextInputComponent,
  Snowflake,
} from "../../adaptor";

type ModalComponent<T> = Omit<
  AdaptorTextInputComponent,
  "type" | "customId"
> & {
  key: T;
};

export type UseModalResult<T extends string> = [
  result: Record<T, string> | null,
  open: (interactionId: Snowflake, token: string) => void
];

export type UseModalParam<TKey extends string> = {
  title: string;
  components:
    | [ModalComponent<TKey>]
    | [ModalComponent<TKey>, ModalComponent<TKey>]
    | [ModalComponent<TKey>, ModalComponent<TKey>, ModalComponent<TKey>]
    | [
        ModalComponent<TKey>,
        ModalComponent<TKey>,
        ModalComponent<TKey>,
        ModalComponent<TKey>
      ]
    | [
        ModalComponent<TKey>,
        ModalComponent<TKey>,
        ModalComponent<TKey>,
        ModalComponent<TKey>,
        ModalComponent<TKey>
      ];
  onSubmit?: (result: Record<TKey, string>) => void;
};

export const useModal = <TKey extends string>(
  param: UseModalParam<TKey>
): UseModalResult<TKey> => {
  const adaptor = getHookContext().adaptor;
  const [result, setResult] = useState<Record<TKey, string> | null>(null);

  //モーダル内部のコンポーネントのcustomIdは固定
  const [customIdKeyEntries] = useState(() =>
    param.components.map((component) => [
      component.key,
      generateCustomId("modalElement"),
    ])
  );

  const keyToCustomIdMap = Object.fromEntries(customIdKeyEntries) as Record<
    TKey,
    string
  >;
  const customIdToKeyMap = Object.fromEntries(
    customIdKeyEntries.map(([key, customId]) => [customId, key])
  ) as Record<string, TKey>;

  const valueChanged = useRef(false);

  const sentModalCustomIdsRef = useRef<Set<Snowflake>>(new Set());

  const openModal = async (
    interactionId: Snowflake,
    token: string
  ): Promise<void> => {
    const customId = generateCustomId("modalRoot");

    const components: AdaptorModalActionRowComponent[] = param.components.map(
      (component) => {
        const componentCustomId = keyToCustomIdMap[component.key];
        const oldValue = result !== null ? result[component.key] : undefined;
        return {
          type: "row",
          components: [
            {
              type: "textInput",
              customId: componentCustomId,
              value: oldValue,
              label: component.label,
              style: component.style,
              placeholder: component.placeholder,
              maxLength: component.maxLength,
              minLength: component.minLength,
              required: component.required,
            },
          ],
        };
      }
    );

    //mapを使うとtupleではなくarrayになってしまうのでキャストしている
    const modalData = {
      title: param.title,
      customId,
      components:
        components as AdaptorInteractionResponseModalData["components"],
    } satisfies AdaptorInteractionResponseModalData;

    const facade = messageFacade(adaptor);
    await facade.openModal(interactionId, token, modalData);

    sentModalCustomIdsRef.current.add(customId);
  };

  useEffect(() => {
    const clear = adaptor.subscribeInteraction(async (interaction) => {
      if (!isAdaptorModalSubmitInteraction(interaction)) return;
      if (!sentModalCustomIdsRef.current.has(interaction.data.customId)) return;
      sentModalCustomIdsRef.current.delete(interaction.data.customId);

      const result = {} as Record<TKey, string>;
      for (const customId in interaction.data.fields) {
        const key = customIdToKeyMap[customId];
        result[key] = interaction.data.fields[customId];
      }
      setResult(result);
      valueChanged.current = true;

      const facade = messageFacade(adaptor);
      await facade.deferUpdate(interaction.id, interaction.token);
    });

    return () => {
      clear();
    };
  });

  useEffect(() => {
    if (valueChanged.current && result !== null) {
      param.onSubmit?.(result);
      valueChanged.current = false;
    }
  }, [result, param.onSubmit]);

  return [result, openModal];
};
