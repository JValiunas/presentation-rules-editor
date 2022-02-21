import * as React from "react";
import { KeySet, Ruleset } from "@itwin/presentation-common"
import { RelatedElementIdsProvider } from "./RelatedElementIdsProvider";
import { IModelConnection } from "@itwin/core-frontend";


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

  return <>
    {JSON.stringify(relatedNodes)}
  </>;
};
