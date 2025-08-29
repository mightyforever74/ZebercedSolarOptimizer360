import {
  List,
  ListItem,
  ListItemSuffix,
  Chip,
  Card,
} from "@material-tailwind/react";
 
export function ListWithBadge() {
  return (
    <Card className="w-96">
    <label htmlFor="algorithm-select" className="block font-medium mb-1">
        Algoritma seçimi için hazır mısınız?
    </label>
      <List>
        <ListItem>
          Klasik/Grid Yöntemi
          <ListItemSuffix>
            <Chip
              value="14"
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
          </ListItemSuffix>
        </ListItem>
        <ListItem>
          AI Checker (Yapay Zeka Denetimli)
          <ListItemSuffix>
            <Chip
              value="2"
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
          </ListItemSuffix>
        </ListItem>
        <ListItem>
          AI / Genetik Algoritma / RL
          <ListItemSuffix>
            <Chip
              value="40"
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
          </ListItemSuffix>
        </ListItem>
      </List>
    </Card>
  );
}