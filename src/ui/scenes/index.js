// One build scene per technology id. A technology missing here gets the
// generic pipeline scene, which draws its build steps from techStory.js.
import ReactScene from './ReactScene.jsx';
import TypeScriptScene from './TypeScriptScene.jsx';
import NodeScene from './NodeScene.jsx';
import ExpressScene from './ExpressScene.jsx';
import MongoScene from './MongoScene.jsx';
import MysqlScene from './MysqlScene.jsx';
import TailwindScene from './TailwindScene.jsx';
import ReduxScene from './ReduxScene.jsx';
import ThreeScene from './ThreeScene.jsx';
import SpringScene from './SpringScene.jsx';
import DotnetScene from './DotnetScene.jsx';
import AngularScene from './AngularScene.jsx';
import NextScene from './NextScene.jsx';
import PostgresScene from './PostgresScene.jsx';
import PythonScene from './PythonScene.jsx';
import DockerScene from './DockerScene.jsx';
import ActionsScene from './ActionsScene.jsx';
import LlmScene from './LlmScene.jsx';
import RagScene from './RagScene.jsx';
import McpScene from './McpScene.jsx';
import GenericScene from './GenericScene.jsx';

export const SCENES = {
  react: ReactScene,
  typescript: TypeScriptScene,
  nodedotjs: NodeScene,
  express: ExpressScene,
  mongodb: MongoScene,
  mysql: MysqlScene,
  tailwindcss: TailwindScene,
  redux: ReduxScene,
  threedotjs: ThreeScene,
  springboot: SpringScene,
  dotnet: DotnetScene,
  angular: AngularScene,
  nextdotjs: NextScene,
  postgresql: PostgresScene,
  python: PythonScene,
  docker: DockerScene,
  githubactions: ActionsScene,
  llm: LlmScene,
  rag: RagScene,
  mcp: McpScene,
};

export const sceneFor = (id) => SCENES[id] ?? GenericScene;
