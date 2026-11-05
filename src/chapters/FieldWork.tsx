import { lazy } from 'react';
import { experienceIntro, roles } from '../content/facts';
import { Chapter, Figure } from '../components/Shells';
import { CareerRuler } from '../components/CareerRuler';
import { RoleEntry } from '../components/Entry';

const Receipt = lazy(() => import('../instruments/Receipt').then((module) => ({ default: module.Receipt })));
const Throughput = lazy(() => import('../instruments/Throughput').then((module) => ({ default: module.Throughput })));
const Ridge = lazy(() => import('../instruments/Ridge').then((module) => ({ default: module.Ridge })));
const IsolationForest = lazy(() => import('../instruments/IsolationForest').then((module) => ({ default: module.IsolationForest })));

const byId = Object.fromEntries(roles.map((r) => [r.id, r]));

export function FieldWork() {
  return (
    <Chapter id="field-work" numeral="II" title="Field Work" subject="Experience" intro={experienceIntro}>
      <CareerRuler />
      <RoleEntry
        role={byId.entervia}
        figure={
          <Figure id="07">
            {() => <Receipt />}
          </Figure>
        }
      />
      <RoleEntry
        role={byId['havelsan-swe']}
        flip
        figure={
          <Figure id="04" dark caption={<>Scale you can feel: the bar fills as you scroll, and the requests arrive at the real daily rate. At that scale, “what is it doing?” deserves a useful answer.</>}>
            {(v) => <Throughput visible={v} />}
          </Figure>
        }
      />
      <RoleEntry
        role={byId['havelsan-mle']}
        figure={
          <Figure id="01" caption={<>Intersection over union measures how much the predicted and reference masks overlap. U-Net scored 82% IoU in the architecture comparison and reached 86% after fine-tuning.</>}>
            {(v) => <Ridge visible={v} />}
          </Figure>
        }
      />
      <RoleEntry
        role={byId.ulak}
        flip
        figure={
          <Figure id="03" caption={<>An autoencoder learns to reconstruct traffic patterns. A flow it reconstructs poorly can be flagged as unusual. In the figure, random cuts isolate unusual points in fewer steps.</>}>
            {(v) => <IsolationForest visible={v} />}
          </Figure>
        }
      />
    </Chapter>
  );
}
