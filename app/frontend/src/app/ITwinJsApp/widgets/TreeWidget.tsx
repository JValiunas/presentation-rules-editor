/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@itwin/core-frontend";
import { EditableRuleset, Tree } from "@itwin/presentation-rules-editor-react";
import { AutoSizer } from "../common/AutoSizer";
import { LoadingHint } from "../common/LoadingHint";
import { OpeningIModelHint } from "../common/OpeningIModelHint";
import { KeySet } from "@itwin/presentation-common"

export interface TreeWidgetProps {
  imodel: IModelConnection | undefined;
  ruleset: EditableRuleset | undefined;
  onNewSelectionSetCallback: (newSelection: KeySet) => void;
}

export function TreeWidget(props: TreeWidgetProps): React.ReactElement {
  const { imodel, ruleset } = props;

  if (imodel === undefined) {
    return <OpeningIModelHint />;
  }

  if (ruleset === undefined) {
    return <LoadingHint />;
  }

  return (
    <AutoSizer>
      {({ width, height }) => <Tree width={width} height={height} iModel={imodel} editableRuleset={ruleset} onNewSelectionSetCallback={props.onNewSelectionSetCallback} />}
    </AutoSizer>
  );
}
