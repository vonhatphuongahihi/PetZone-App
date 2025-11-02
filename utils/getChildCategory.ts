export interface ChildCategory {
  id: number;
  name: string;
}

export const getChildCategory = (categories: any[]): ChildCategory[] => {
  const leaves: ChildCategory[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      if (!node.children || node.children.length === 0) {
        leaves.push({ id: node.id, name: node.name });
      } else {
        traverse(node.children);
      }
    });
  };

  traverse(categories);
  return leaves;
};
