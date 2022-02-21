/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import type { TreeModelChanges, TreeModelSource } from "@itwin/components-react";
import { useDisposable } from "@itwin/core-react";
import type { VisibilityTreeEventHandlerParams } from "@itwin/appui-react";
import { VisibilityTreeEventHandler } from "@itwin/appui-react";
import { KeySet } from "@itwin/presentation-common"

export interface SelectionTrackingUnifiedSelectionTreeEventHandlerParams extends VisibilityTreeEventHandlerParams {
  onNewSelectionSetCallback: (newSelection: KeySet) => void;
}

export class SelectionTrackingUnifiedSelectionTreeEventHandler extends VisibilityTreeEventHandler {
  private _onNewSelectionSetCallback: (newSelection: KeySet) => void;

  constructor(params: SelectionTrackingUnifiedSelectionTreeEventHandlerParams){
    super(params);
    this._onNewSelectionSetCallback = params.onNewSelectionSetCallback;
  }
  private collectSelectedNodeKeys(modelSource: TreeModelSource): KeySet{
    const computedKeySet = new KeySet();
    const nodeIterator = modelSource.getModel().iterateTreeModelNodes();
    for (const treeNode of nodeIterator){
      if (treeNode.isSelected)
        {
        const key = this.getNodeKey(treeNode.item);
        computedKeySet.add(key);
        }
    }
    return computedKeySet;
  }

  public override selectNodes(modelChange?: TreeModelChanges) {
    super.selectNodes(modelChange);
    if (this._onNewSelectionSetCallback)
      this._onNewSelectionSetCallback(this.collectSelectedNodeKeys(this.modelSource));
  }
}

/**
 * A custom hook which creates and disposes `UnifiedSelectionTreeEventHandler`
 * @beta
 */
export function useSelectionTrackingUnifiedSelectionTreeEventHandler(props: SelectionTrackingUnifiedSelectionTreeEventHandlerParams) {
  return useDisposable(React.useCallback(
    () => new SelectionTrackingUnifiedSelectionTreeEventHandler(props),
    Object.values(props), /* eslint-disable-line react-hooks/exhaustive-deps */ /* want to re-create the handler whenever any prop changes */
  ));
}
