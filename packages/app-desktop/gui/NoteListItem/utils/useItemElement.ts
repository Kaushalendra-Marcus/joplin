import * as React from 'react';
import { Size } from '@joplin/utils/types';
import { useEffect, useRef, useState } from 'react';
import { ItemFlow } from '@joplin/lib/services/plugins/api/noteListType';

const useItemElement = (
	rootElement: HTMLDivElement, noteId: string, noteHtml: string, focusVisible: boolean, style: React.CSSProperties, itemSize: Size, onClick: React.MouseEventHandler<HTMLDivElement>, onDoubleClick: React.MouseEventHandler<HTMLDivElement>, flow: ItemFlow,
) => {
	const [itemElement, setItemElement] = useState<HTMLDivElement>(null);
	const onClickRef = useRef(onClick);
	const onDoubleClickRef = useRef(onDoubleClick);
	onClickRef.current = onClick;
	onDoubleClickRef.current = onDoubleClick;

	useEffect(() => {
		if (!rootElement) return () => {};

		const element = document.createElement('div');
		element.setAttribute('data-id', noteId);
		element.className = 'note-list-item';
		rootElement.appendChild(element);
		setItemElement(element);
		return () => {
			element.remove();
		};
	}, [rootElement, noteId]);

	useEffect(() => {
		if (!itemElement) return;
		for (const [n, v] of Object.entries(style)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Old code before rule was applied
			(itemElement.style as any)[n] = v;
		}
		if (flow === ItemFlow.LeftToRight) itemElement.style.width = `${itemSize.width}px`;
		itemElement.style.height = `${itemSize.height}px`;
		itemElement.innerHTML = noteHtml;
	}, [itemElement, style, flow, itemSize, noteHtml]);

	useEffect(() => {
		if (!itemElement) return () => {};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we're mixing React synthetic events with DOM events which ideally should not be done but it is fine in this particular case
		const handleClick = (e: any) => onClickRef.current?.(e);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we're mixing React synthetic events with DOM events which ideally should not be done but it is fine in this particular case
		const handleDblClick = (e: any) => onDoubleClickRef.current?.(e);
		itemElement.addEventListener('click', handleClick);
		itemElement.addEventListener('dblclick', handleDblClick);
		return () => {
			itemElement.removeEventListener('click', handleClick);
			itemElement.removeEventListener('dblclick', handleDblClick);
		};
	}, [itemElement]);

	useEffect(() => {
		if (!itemElement) return;

		if (focusVisible) {
			itemElement.classList.add('-focus-visible');
		} else {
			itemElement.classList.remove('-focus-visible');
		}
	}, [focusVisible, itemElement]);

	return itemElement;
};

export default useItemElement;