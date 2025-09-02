// Module de composants modaux fonctionnels
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Import des modales fonctionnelles existantes
import { ApprovalQueueModal as FunctionalApprovalQueueModal } from "./ApprovalQueueModal";
import { ReportGenerationModal as FunctionalReportGenerationModal } from "./ReportGenerationModal";
import { CreateAnnotationModal as FunctionalCreateAnnotationModal } from "./CreateAnnotationModal";
import { NewPersonalizedAlertModal as FunctionalNewPersonalizedAlertModal } from "./NewPersonalizedAlertModal";
import { NewDeadlineModal as FunctionalNewDeadlineModal } from "./NewDeadlineModal";
import { NewAlertTypeModal as FunctionalNewAlertTypeModal } from "./NewAlertTypeModal";
import { NewChannelModal as FunctionalNewChannelModal } from "./NewChannelModal";
import { NewRoleModal as FunctionalNewRoleModal } from "./NewRoleModal";
import { NewPermissionModal as FunctionalNewPermissionModal } from "./NewPermissionModal";
import { UserManagementModal as FunctionalUserManagementModal } from "./UserManagementModal";

// Import des nouvelles modales spécifiques
import { ManagementModal as FunctionalManagementModal } from "./ManagementModal";
import { SignatoryManagementModal as FunctionalSignatoryManagementModal } from "./SignatoryManagementModal";
import { VideoPlayerModal as FunctionalVideoPlayerModal } from "./VideoPlayerModal";
import { LegalTextConsultationModal as FunctionalLegalTextConsultationModal } from "./LegalTextConsultationModal";
import { ApiImportModal as FunctionalApiImportModal } from "./ApiImportModal";
import { BatchImportModal as FunctionalBatchImportModal } from "./BatchImportModal";
import { SemanticSearchModal as FunctionalSemanticSearchModal } from "./SemanticSearchModal";

// Import des nouvelles modales de nomenclature
import { LegalTypeModal as FunctionalLegalTypeModal } from "./LegalTypeModal";
import { ProcedureCategoryModal as FunctionalProcedureCategoryModal } from "./ProcedureCategoryModal";
import { LegalDomainModal as FunctionalLegalDomainModal } from "./LegalDomainModal";
import { OrganizationModal as FunctionalOrganizationModal } from "./OrganizationModal";

// Export des modales fonctionnelles
export const ApprovalQueueModal = FunctionalApprovalQueueModal;
export const ReportGenerationModal = FunctionalReportGenerationModal; 
export const CreateAnnotationModal = FunctionalCreateAnnotationModal;
export const NewPersonalizedAlertModal = FunctionalNewPersonalizedAlertModal;
export const NewDeadlineModal = FunctionalNewDeadlineModal;
export const NewAlertTypeModal = FunctionalNewAlertTypeModal;
export const NewChannelModal = FunctionalNewChannelModal;
export const NewRoleModal = FunctionalNewRoleModal;
export const NewPermissionModal = FunctionalNewPermissionModal;
export const UserManagementModal = FunctionalUserManagementModal;

// Export des nouvelles modales spécifiques
export const ManagementModal = FunctionalManagementModal;
export const SignatoryManagementModal = FunctionalSignatoryManagementModal;
export const VideoPlayerModal = FunctionalVideoPlayerModal;
export const LegalTextConsultationModal = FunctionalLegalTextConsultationModal;
export const ApiImportModal = FunctionalApiImportModal;
export const BatchImportModal = FunctionalBatchImportModal;
export const SemanticSearchModal = FunctionalSemanticSearchModal;

// Export des nouvelles modales de nomenclature
export const LegalTypeModal = FunctionalLegalTypeModal;
export const ProcedureCategoryModal = FunctionalProcedureCategoryModal;
export const LegalDomainModal = FunctionalLegalDomainModal;
export const OrganizationModal = FunctionalOrganizationModal;

export default FunctionalUserManagementModal;