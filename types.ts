
export enum UserRole {
    REQUESTER = 'Requester',
    HEAD_BRANCH = 'Head Cabang',
    DEPARTMENT = 'Departement',
}

export enum RequestStatus {
    OPEN = 'Open',
    APPROVED_HEAD = 'Approved by Head',
    APPROVED_DEPT = 'On Process', // As per requirement: Approved by Dept -> On Process
    COMPLETED = 'Completed',
}

export enum SubmissionType {
    HARGA_JUAL = 'Harga Jual',
    BIAYA = 'Biaya',
    ROUTING = 'Routing',
    DATA_REQUEST = 'Request Data'
}

export interface Submission {
    id: string;
    type: SubmissionType;
    title: string;
    description?: string; // Optional depending on form type
    requesterName: string;
    date: string;
    status: RequestStatus;
    resultDataUrl?: string; // For the final upload/link
    formDetails?: any; // Flexible to hold different form data structure
}

export interface ValidationRow {
    id: number;
    Service: string;
    Tarif: number;
    sla_form: number; // Changed from sla_from
    sla_thru: number;
    [key: string]: any;
}

export interface ValidationDetail {
    column: string;
    itValue: string | number;
    masterValue: string | number;
    isMatch: boolean;
}

export interface ValidationMismatch {
    rowId: number;
    reasons: string[];
    details: ValidationDetail[]; // Added for detailed modal view
}

export interface FullValidationRow {
    origin: string;
    dest: string;
    sysCode: string;
    // Removed threeCode
    serviceMaster: string;
    tarifMaster: number;
    slaFormMaster: number;
    slaThruMaster: number;
    serviceIT: string;
    tarifIT: number;
    slaFormIT: number;
    slaThruIT: number;
    keterangan: string;
}

export interface ValidationResult {
    totalRows: number;
    matches: number;
    mismatches: ValidationMismatch[];
    fullReport: FullValidationRow[]; // New field for the Excel-like view
}
