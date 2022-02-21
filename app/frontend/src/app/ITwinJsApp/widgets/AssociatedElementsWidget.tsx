import * as React from "react";
import { KeySet, Ruleset } from "@itwin/presentation-common"
import { RelatedElementIdsProvider } from "./RelatedElementIdsProvider";
import { IModelConnection } from "@itwin/core-frontend";
import { Table } from "@itwin/itwinui-react";


export interface AssociatedElementsWidgetProps {
  imodel: IModelConnection;
  ruleset: Ruleset;
  selectedTreeNodes: KeySet;
}

export function AssociatedElementsWidget(props: AssociatedElementsWidgetProps): React.ReactElement {
  const [relatedNodes, setRelatedNodes] = React.useState(new KeySet());

  try{
  React.useEffect( () => {
    if (props.selectedTreeNodes.isEmpty)
      return;
    const idsProvider = new RelatedElementIdsProvider(props.imodel, props.ruleset, props.selectedTreeNodes);
    idsProvider.getRelatedNodes().then( (keys) => {
      setRelatedNodes(keys);
    });
  }, [props.selectedTreeNodes]);
  }
  catch(ex){
    console.log(JSON.stringify(ex));
  }

const columnsDescription = React.useMemo(() => {
  return {
      Header: 'Associated Elements',
      columns: [
        {
          Filter: function noRefCheck(){},
          Header: 'Class Name',
          accessor: 'classname',
          id: 'classname'
        },
        {
          Header: 'Count',
          accessor: 'count',
          id: 'count'
        },
        {
          Header: 'ECInstanceId',
          accessor: "ecinstanceid",
          id: 'ecinstanceid'
        }
      ]
    }

}, []);

const data = React.useMemo(() => {
  const computedObject: Record<string, unknown>[] = [];
  relatedNodes.instanceKeys.forEach( (ecinstanceids, className) => {
    const entries: Record<string, unknown>[] = [];
    for (const entry of ecinstanceids){
      entries.push({
        classname: className,
        ecinstanceid: entry,
        subRows: []
      });
    }

    computedObject.push({
      classname: className,
      count: ecinstanceids.size,
      subRows: entries
    });
  });
  return computedObject;
}, [relatedNodes]);

return <Table
    columns={[
      columnsDescription
    ]}
    data={
      data
    }
    density="default"
    emptyFilteredTableContent="No results found. Clear or try another filter."
    emptyTableContent="No data."
    isSortable
    isResizable
    onExpand={function noRefCheck(){}}
  />;

};
