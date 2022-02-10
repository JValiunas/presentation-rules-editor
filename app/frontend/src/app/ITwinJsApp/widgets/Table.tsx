/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Table as UiTable } from "@itwin/components-react";
import { IModelConnection } from "@itwin/core-frontend";
import { useDisposable } from "@itwin/core-react";
import { PresentationTableDataProvider, tableWithUnifiedSelection } from "@itwin/presentation-components";

// eslint-disable-next-line deprecation/deprecation
const UnifiedSelectionTable = tableWithUnifiedSelection(UiTable);

export interface TableProps {
  imodel: IModelConnection;
  rulesetId: string;
}

export function Table(props: TableProps): React.ReactElement {
  const { imodel, rulesetId } = props;
  const dataProvider = useDisposable(React.useCallback(() => new PresentationTableDataProvider({
    imodel,
    ruleset: rulesetId,
    enableContentAutoUpdate: true,
  }), [imodel, rulesetId]));

  return (
    <UnifiedSelectionTable
      dataProvider={dataProvider}
    />
  );
}
