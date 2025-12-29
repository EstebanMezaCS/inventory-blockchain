package com.inventory.blockchain.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.inventory.blockchain.dto.TransferItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.TreeMap;

@Component
public class ItemsHashUtil {

    private static final Logger log = LoggerFactory.getLogger(ItemsHashUtil.class);

    private final ObjectMapper objectMapper;

    public ItemsHashUtil() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
    }

    public String computeItemsHash(List<TransferItem> items) {
        String canonicalJson = canonicalizeItems(items);
        log.debug("Canonical JSON for hashing: {}", canonicalJson);

        byte[] jsonBytes = canonicalJson.getBytes(StandardCharsets.UTF_8);
        byte[] hashBytes = Hash.sha3(jsonBytes);
        String hash = Numeric.toHexString(hashBytes);

        log.debug("Computed itemsHash: {}", hash);
        return hash;
    }

    private String canonicalizeItems(List<TransferItem> items) {
        List<TransferItem> sortedItems = items.stream()
                .sorted(Comparator.comparing(TransferItem::sku))
                .toList();

        ArrayNode arrayNode = objectMapper.createArrayNode();
        for (TransferItem item : sortedItems) {
            ObjectNode itemNode = objectMapper.createObjectNode();
            itemNode.put("qty", item.qty());
            itemNode.put("sku", item.sku());
            arrayNode.add(itemNode);
        }

        JsonNode canonicalNode = sortJsonNode(arrayNode);

        try {
            return objectMapper.writeValueAsString(canonicalNode);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize items to JSON", e);
        }
    }

    private JsonNode sortJsonNode(JsonNode node) {
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            TreeMap<String, JsonNode> sortedMap = new TreeMap<>();

            Iterator<String> fieldNames = objectNode.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                sortedMap.put(fieldName, sortJsonNode(objectNode.get(fieldName)));
            }

            ObjectNode sortedNode = objectMapper.createObjectNode();
            sortedMap.forEach(sortedNode::set);
            return sortedNode;
        } else if (node.isArray()) {
            ArrayNode arrayNode = (ArrayNode) node;
            ArrayNode sortedArray = objectMapper.createArrayNode();

            for (JsonNode element : arrayNode) {
                sortedArray.add(sortJsonNode(element));
            }

            return sortedArray;
        }

        return node;
    }

    public byte[] hashToBytes32(String hexHash) {
        String cleanHash = hexHash.startsWith("0x") ? hexHash.substring(2) : hexHash;

        if (cleanHash.length() != 64) {
            throw new IllegalArgumentException("Hash must be 64 hex characters (32 bytes)");
        }

        return Numeric.hexStringToByteArray(hexHash);
    }
}
