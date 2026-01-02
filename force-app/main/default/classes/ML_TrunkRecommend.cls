public with sharing class ML_TrunkRecommend {

    public class Input {
        @InvocableVariable(required=true) public String tripStyle;       // Business/Leisure/LongStay/Event (필드값과 동일해야 함)
        @InvocableVariable(required=true) public String luggageMode;     // Cabin/Checkin
        @InvocableVariable(required=true) public String material;        // Canvas/Leather/Aluminum/WoodLeather
        @InvocableVariable(required=true) public String customization;   // Initials/HardwareFinish/TrimColor/FullBespoke
    }

    public class Output {
        @InvocableVariable public Id productId;
        @InvocableVariable public String name;
        @InvocableVariable public String productCode;
        @InvocableVariable public Decimal price;
        @InvocableVariable public String description;
    }

    private static Integer scoreProduct(Product2 p, Input req) {
        Integer s = 0;

        // 네 실제 필드명: Trip_Style__c (Multi-Select Picklist)
        // Multi-select picklist 값은 세미콜론으로 저장되는 문자열이라 contains 체크가 동작함 :contentReference[oaicite:2]{index=2}
        if (p.Trip_Style__c != null && req.tripStyle != null && p.Trip_Style__c.contains(req.tripStyle)) {
            s += 3;
        }

        // 네 실제 필드명: Luggage_Mode__c (Picklist)
        if (p.Luggage_Mode__c != null && req.luggageMode != null && p.Luggage_Mode__c == req.luggageMode) {
            s += 2;
        }

        // 네 실제 필드명: Customization_Level__c (Picklist)
        if (p.Customization_Level__c != null && req.customization != null && p.Customization_Level__c == req.customization) {
            s += 2;
        }

        return s;
    }

    private static Boolean isBetter(Integer scoreA, Decimal priceA, Integer scoreB, Decimal priceB) {
        if (scoreA == null) scoreA = 0;
        if (scoreB == null) scoreB = 0;
        if (priceA == null) priceA = 0;
        if (priceB == null) priceB = 0;

        if (scoreA != scoreB) return scoreA > scoreB;
        return priceA > priceB;
    }

    @InvocableMethod(label='Maison Lavin Trunk Recommend' description='Return top 3 trunks from Product2 for Maison Lavin')
    public static List<Output> run(List<Input> inputs) {
        if (inputs == null || inputs.isEmpty()) return new List<Output>();
        Input req = inputs[0];

        // SELECT에도 실제 필드 API Name으로 교체
        List<Product2> candidates = [
            SELECT Id, Name, ProductCode, Price__c, Description, Material__c,
                   Subcategory__c, Trip_Style__c, Luggage_Mode__c, Customization_Level__c,
                   Family, IsActive
            FROM Product2
            WHERE IsActive = true
              AND Family = 'Travel'
              AND Subcategory__c = 'Trunk'
              AND Material__c = :req.material
        ];

        Product2 best1; Integer s1; Decimal p1;
        Product2 best2; Integer s2; Decimal p2;
        Product2 best3; Integer s3; Decimal p3;

        for (Product2 p : candidates) {
            Integer sp = scoreProduct(p, req);
            Decimal pr = p.Price__c;

            if (best1 == null || isBetter(sp, pr, s1, p1)) {
                best3 = best2; s3 = s2; p3 = p2;
                best2 = best1; s2 = s1; p2 = p1;
                best1 = p;     s1 = sp; p1 = pr;
            } else if (best2 == null || isBetter(sp, pr, s2, p2)) {
                best3 = best2; s3 = s2; p3 = p2;
                best2 = p;     s2 = sp; p2 = pr;
            } else if (best3 == null || isBetter(sp, pr, s3, p3)) {
                best3 = p;     s3 = sp; p3 = pr;
            }
        }

        List<Output> out = new List<Output>();
        if (best1 != null) out.add(toOutput(best1));
        if (best2 != null) out.add(toOutput(best2));
        if (best3 != null) out.add(toOutput(best3));

        if (out.isEmpty()) {
            List<Product2> fallback = [
                SELECT Id, Name, ProductCode, Price__c, Description
                FROM Product2
                WHERE IsActive = true
                  AND Family = 'Travel'
                  AND Subcategory__c = 'Trunk'
                ORDER BY Price__c DESC
                LIMIT 3
            ];
            for (Product2 fp : fallback) out.add(toOutput(fp));
        }

        return out;
    }

    private static Output toOutput(Product2 p) {
        Output o = new Output();
        o.productId = p.Id;
        o.name = p.Name;
        o.productCode = p.ProductCode;
        o.price = p.Price__c;
        o.description = p.Description;
        return o;
    }
}