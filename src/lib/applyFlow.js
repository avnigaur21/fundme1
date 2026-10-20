import { apiStageExtensionSession, API_BASE } from "./api";
import { getUserId, getUser } from "./auth";

export const getApplyLink = (item = {}) =>
  item.apply_link ||
  item.source_url ||
  item.link ||
  item.external_apply_url ||
  item.opportunity?.external_apply_url ||
  item.opportunity?.link ||
  "";

export const stageExtensionContext = ({ opportunity_id, external_url }) => {
  window.postMessage({
    source: "fundme-web",
    type: "FUNDME_STASH_SESSION",
    user_id: getUserId(),
    opportunity_id,
    session_token: getUser()?.session_token,
    baseUrl: new URL(API_BASE, window.location.origin).href.replace(/\/api$/, ""),
  }, "*");

  return apiStageExtensionSession({ opportunity_id, external_url });
};
