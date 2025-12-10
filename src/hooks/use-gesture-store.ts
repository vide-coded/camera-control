import { useStore } from "@tanstack/react-store";

import {
	type GestureState,
	gestureActions,
	gestureStore,
} from "@/stores/gesture-store";

export function useGestureState<T>(selector: (state: GestureState) => T) {
	return useStore(gestureStore, selector);
}

export { gestureActions, gestureStore };
